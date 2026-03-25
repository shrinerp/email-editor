namespace EmailEditor.Models;

public record TwoColumnBlock(
    IReadOnlyList<IEmailBlock> LeftBlocks,
    IReadOnlyList<IEmailBlock> RightBlocks
) : IEmailBlock;
