namespace EmailEditor.Models;

public record TextBlock(string HtmlContent) : IEmailBlock;
