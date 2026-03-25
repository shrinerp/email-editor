namespace EmailEditor.Models;

public record ButtonBlock(
    string Label,
    string Url,
    string BackgroundColor = "#000000",
    string TextColor = "#ffffff"
) : IEmailBlock;
