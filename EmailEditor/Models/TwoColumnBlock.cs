namespace EmailEditor.Models;

public record ColumnsBlock(IReadOnlyList<IReadOnlyList<IEmailBlock>> Columns) : IEmailBlock;
