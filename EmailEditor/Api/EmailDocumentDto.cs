using System.Text.Json;
using System.Text.Json.Serialization;
using EmailEditor.Models;

namespace EmailEditor.Api;

// DTOs for JSON deserialization with polymorphic block types

public record EmailDocumentDto(
    List<JsonElement> Blocks
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
}
