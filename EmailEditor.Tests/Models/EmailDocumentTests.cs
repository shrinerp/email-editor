using EmailEditor.Models;

namespace EmailEditor.Tests.Models;

public class EmailDocumentTests
{
    [Fact]
    public void EmailDocument_CanBeConstructedWithAllBlockTypes()
    {
        var blocks = new List<IEmailBlock>
        {
            new HeroBlock("https://example.com/img.jpg", "Hello World"),
            new TextBlock("<p>Some text</p>"),
            new ButtonBlock("Click Me", "https://example.com"),
            new ImageBlock("https://example.com/img.jpg", "Alt text"),
            new DividerBlock(),
            new ColumnsBlock(new List<IReadOnlyList<IEmailBlock>>
            {
                new List<IEmailBlock> { new TextBlock("<p>Left</p>") }.AsReadOnly(),
                new List<IEmailBlock> { new TextBlock("<p>Right</p>") }.AsReadOnly(),
            }.AsReadOnly()),
        };

        var doc = new EmailDocument(Blocks: blocks.AsReadOnly());

        Assert.Equal(6, doc.Blocks.Count);
    }

    [Fact]
    public void EmailDocument_Blocks_IsIReadOnlyList()
    {
        var doc = new EmailDocument(new List<IEmailBlock>().AsReadOnly());
        Assert.IsAssignableFrom<IReadOnlyList<IEmailBlock>>(doc.Blocks);
    }

    [Fact]
    public void HeroBlock_HasCorrectProperties()
    {
        var block = new HeroBlock("https://img.url", "My Headline");
        Assert.Equal("https://img.url", block.ImageUrl);
        Assert.Equal("My Headline", block.Headline);
    }

    [Fact]
    public void TextBlock_HasCorrectProperties()
    {
        var block = new TextBlock("<p>Hello</p>");
        Assert.Equal("<p>Hello</p>", block.HtmlContent);
    }

    [Fact]
    public void ButtonBlock_HasCorrectProperties_AndDefaults()
    {
        var block = new ButtonBlock("Click", "https://url.com");
        Assert.Equal("Click", block.Label);
        Assert.Equal("https://url.com", block.Url);
        Assert.Equal("#000000", block.BackgroundColor);
        Assert.Equal("#ffffff", block.TextColor);
    }

    [Fact]
    public void ButtonBlock_AllowsCustomColors()
    {
        var block = new ButtonBlock("Click", "https://url.com", "#ff0000", "#00ff00");
        Assert.Equal("#ff0000", block.BackgroundColor);
        Assert.Equal("#00ff00", block.TextColor);
    }

    [Fact]
    public void ImageBlock_HasCorrectProperties()
    {
        var block = new ImageBlock("https://img.url", "A photo");
        Assert.Equal("https://img.url", block.ImageUrl);
        Assert.Equal("A photo", block.AltText);
    }

    [Fact]
    public void DividerBlock_ImplementsIEmailBlock()
    {
        IEmailBlock block = new DividerBlock();
        Assert.NotNull(block);
    }

    [Fact]
    public void ColumnsBlock_HasCorrectColumns()
    {
        var col0 = new List<IEmailBlock> { new TextBlock("<p>Left</p>") }.AsReadOnly();
        var col1 = new List<IEmailBlock> { new TextBlock("<p>Right</p>") }.AsReadOnly();
        var cols = new List<IReadOnlyList<IEmailBlock>> { col0, col1 }.AsReadOnly();
        var block = new ColumnsBlock(cols);
        Assert.Equal(2, block.Columns.Count);
        Assert.Same(col0, block.Columns[0]);
        Assert.Same(col1, block.Columns[1]);
    }

    [Fact]
    public void ColumnsBlock_SupportsEmptyColumns()
    {
        var cols = new List<IReadOnlyList<IEmailBlock>>
        {
            new List<IEmailBlock>().AsReadOnly(),
            new List<IEmailBlock>().AsReadOnly(),
        }.AsReadOnly();
        var block = new ColumnsBlock(cols);
        Assert.All(block.Columns, col => Assert.Empty(col));
    }

    [Fact]
    public void AllBlockTypes_ImplementIEmailBlock()
    {
        var emptyCols = new List<IReadOnlyList<IEmailBlock>>
        {
            new List<IEmailBlock>().AsReadOnly(),
            new List<IEmailBlock>().AsReadOnly(),
        }.AsReadOnly();
        Assert.IsAssignableFrom<IEmailBlock>(new HeroBlock("u", "h"));
        Assert.IsAssignableFrom<IEmailBlock>(new TextBlock("t"));
        Assert.IsAssignableFrom<IEmailBlock>(new ButtonBlock("l", "u"));
        Assert.IsAssignableFrom<IEmailBlock>(new ImageBlock("u", "a"));
        Assert.IsAssignableFrom<IEmailBlock>(new DividerBlock());
        Assert.IsAssignableFrom<IEmailBlock>(new ColumnsBlock(emptyCols));
    }
}
