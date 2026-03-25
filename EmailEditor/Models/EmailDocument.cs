namespace EmailEditor.Models;

public record EmailDocument(
    IReadOnlyList<IEmailBlock> Blocks
);
