using System.Text.Json;
using System.Text.Json.Serialization;
using EmailEditor.Models;

namespace EmailEditor.Api;

// DTOs for JSON deserialization with polymorphic block types

public record EmailDocumentDto(
    string Subject,
    string PreviewText,
    string FromName,
    string FromAddress,
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

        return new EmailDocument(
            dto.Subject ?? "",
            dto.PreviewText ?? "",
            dto.FromName ?? "",
            dto.FromAddress ?? "",
            blocks
        );
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
                sanitize(GetString(el, "leftHtmlContent")),
                sanitize(GetString(el, "rightHtmlContent"))),

            _ => null
        };
    }

    private static string GetString(JsonElement el, string prop) =>
        el.TryGetProperty(prop, out var v) ? v.GetString() ?? "" : "";

    private static string GetStringOrDefault(JsonElement el, string prop, string defaultValue) =>
        el.TryGetProperty(prop, out var v) ? v.GetString() ?? defaultValue : defaultValue;
}
