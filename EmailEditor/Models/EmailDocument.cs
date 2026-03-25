namespace EmailEditor.Models;

public record EmailDocument(
    string Subject,
    string PreviewText,
    string FromName,
    string FromAddress,
    IReadOnlyList<IEmailBlock> Blocks
);
