namespace EmailEditor.Models;

public record TwoColumnBlock(string LeftHtmlContent, string RightHtmlContent) : IEmailBlock;
