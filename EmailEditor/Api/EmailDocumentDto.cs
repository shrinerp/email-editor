using System.Text.Json;
using System.Text.Json.Serialization;
using EmailEditor.Models;
using EmailEditor.Services;

namespace EmailEditor.Api;

// DTOs for JSON deserialization with polymorphic block types

public record EmailDocumentDto(
    List<JsonElement> Blocks,
    JsonElement? MergeData = null
);

public static class EmailDocumentDtoExtensions
{
    public static EmailDocument ToEmailDocument(this EmailDocumentDto dto, Func<string, string> sanitize)
    {
        var blocks = dto.Blocks
            .Select(b => DeserializeBlock(b, sanitize))
            .Where(b => b is not null)
            .Cast<IEmailBlock>()
            .ToList()
            .AsReadOnly();

        return new EmailDocument(blocks);
    }

    private static IEmailBlock? DeserializeBlock(JsonElement el, Func<string, string> sanitize)
    {
        var type = el.TryGetProperty("type", out var t) ? t.GetString() : null;

        return type switch
        {
            "hero" => new HeroBlock(
                GetString(el, "imageUrl"),
                GetString(el, "headline")),

            "text" => new TextBlock(
                sanitize(GetString(el, "htmlContent"))),

            "button" => new ButtonBlock(
                GetString(el, "label"),
                GetString(el, "url"),
                GetStringOrDefault(el, "backgroundColor", "#000000"),
                GetStringOrDefault(el, "textColor", "#ffffff")),

            "image" => new ImageBlock(
                GetString(el, "imageUrl"),
                GetString(el, "altText")),

            "divider" => new DividerBlock(),

            "header" => new HeaderBlock(
                GetString(el, "text"),
                el.TryGetProperty("level", out var lv) && lv.TryGetInt32(out var lvInt) ? lvInt : 1,
                GetStringOrDefault(el, "alignment", "left")),

            "twoColumn" => new TwoColumnBlock(
                DeserializeBlockList(GetArray(el, "leftBlocks"), sanitize),
                DeserializeBlockList(GetArray(el, "rightBlocks"), sanitize)),

            _ => null
        };
    }

    private static IReadOnlyList<IEmailBlock> DeserializeBlockList(
        IEnumerable<JsonElement> elements, Func<string, string> sanitize) =>
        elements
            .Select(e => DeserializeBlock(e, sanitize))
            .Where(b => b is not null)
            .Cast<IEmailBlock>()
            .ToList()
            .AsReadOnly();

    private static IEnumerable<JsonElement> GetArray(JsonElement el, string prop) =>
        el.TryGetProperty(prop, out var v) && v.ValueKind == JsonValueKind.Array
            ? v.EnumerateArray()
            : Enumerable.Empty<JsonElement>();

    private static string GetString(JsonElement el, string prop) =>
        el.TryGetProperty(prop, out var v) ? v.GetString() ?? "" : "";

    private static string GetStringOrDefault(JsonElement el, string prop, string defaultValue) =>
        el.TryGetProperty(prop, out var v) ? v.GetString() ?? defaultValue : defaultValue;

    // ── Merge application ─────────────────────────────────────────────────────

    public static EmailDocument ApplyMerge(EmailDocument doc, JsonElement mergeData)
    {
        var merged = doc.Blocks
            .Select(b => ApplyMergeToBlock(b, mergeData))
            .ToList()
            .AsReadOnly();
        return new EmailDocument(merged);
    }

    private static IEmailBlock ApplyMergeToBlock(IEmailBlock block, JsonElement data) => block switch
    {
        HeroBlock h => h with { Headline = MergeService.Resolve(h.Headline, data) },
        TextBlock t => t with { HtmlContent = MergeService.Resolve(t.HtmlContent, data) },
        ButtonBlock b => b with { Label = MergeService.Resolve(b.Label, data) },
        ImageBlock i => i with { AltText = MergeService.Resolve(i.AltText, data) },
        HeaderBlock h => h with { Text = MergeService.Resolve(h.Text, data) },
        TwoColumnBlock tc => tc with
        {
            LeftBlocks = tc.LeftBlocks.Select(b => ApplyMergeToBlock(b, data)).ToList().AsReadOnly(),
            RightBlocks = tc.RightBlocks.Select(b => ApplyMergeToBlock(b, data)).ToList().AsReadOnly(),
        },
        _ => block
    };
}
