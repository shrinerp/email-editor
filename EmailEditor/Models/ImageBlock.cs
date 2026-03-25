namespace EmailEditor.Models;

public record ImageBlock(string ImageUrl, string AltText) : IEmailBlock;
