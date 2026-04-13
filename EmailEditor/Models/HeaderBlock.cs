namespace EmailEditor.Models;

public record HeaderBlock(string Text, int Level = 1, string Alignment = "left") : IEmailBlock;
