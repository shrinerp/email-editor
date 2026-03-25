using System.Text.Json;
using System.Text.RegularExpressions;

namespace EmailEditor.Services;

public static class MergeService
{
    private static readonly Regex TokenPattern = new(@"\{\{([^}]+)\}\}", RegexOptions.Compiled);

    public static string Resolve(string template, JsonElement data)
    {
        if (data.ValueKind == JsonValueKind.Undefined || data.ValueKind == JsonValueKind.Null)
            return template;

        return TokenPattern.Replace(template, match =>
        {
            var path = match.Groups[1].Value.Trim();
            return ResolvePath(data, path);
        });
    }

    private static string ResolvePath(JsonElement root, string path)
    {
        var segments = path.Split('.');
        var current = root;

        foreach (var segment in segments)
        {
            if (current.ValueKind != JsonValueKind.Object)
                return "";
            if (!current.TryGetProperty(segment, out current))
                return "";
        }

        return current.ValueKind switch
        {
            JsonValueKind.String => current.GetString() ?? "",
            JsonValueKind.Number => current.GetRawText(),
            JsonValueKind.True => "true",
            JsonValueKind.False => "false",
            _ => ""  // Object, Array, Null → blank
        };
    }
}
