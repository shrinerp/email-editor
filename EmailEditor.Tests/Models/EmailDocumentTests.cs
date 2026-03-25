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
            new TwoColumnBlock(
                new List<IEmailBlock> { new TextBlock("<p>Left</p>") }.AsReadOnly(),
                new List<IEmailBlock> { new TextBlock("<p>Right</p>") }.AsReadOnly()),
        };

        var doc = new EmailDocument(
            Subject: "Test Subject",
            PreviewText: "Preview snippet",
            FromName: "Sender Name",
            FromAddress: "sender@example.com",
            Blocks: blocks.AsReadOnly()
        );

        Assert.Equal("Test Subject", doc.Subject);
        Assert.Equal("Preview snippet", doc.PreviewText);
        Assert.Equal("Sender Name", doc.FromName);
        Assert.Equal("sender@example.com", doc.FromAddress);
        Assert.Equal(6, doc.Blocks.Count);
    }

    [Fact]
    public void EmailDocument_Blocks_IsIReadOnlyList()
    {
        var doc = new EmailDocument("S", "P", "F", "f@f.com", new List<IEmailBlock>().AsReadOnly());
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
    public void TwoColumnBlock_HasCorrectProperties()
    {
        var left = new List<IEmailBlock> { new TextBlock("<p>Left</p>") }.AsReadOnly();
        var right = new List<IEmailBlock> { new TextBlock("<p>Right</p>") }.AsReadOnly();
        var block = new TwoColumnBlock(left, right);
        Assert.Same(left, block.LeftBlocks);
        Assert.Same(right, block.RightBlocks);
    }

    [Fact]
    public void TwoColumnBlock_SupportsEmptyColumns()
    {
        var block = new TwoColumnBlock(
            new List<IEmailBlock>().AsReadOnly(),
            new List<IEmailBlock>().AsReadOnly());
        Assert.Empty(block.LeftBlocks);
        Assert.Empty(block.RightBlocks);
    }

    [Fact]
    public void AllBlockTypes_ImplementIEmailBlock()
    {
        var emptyList = new List<IEmailBlock>().AsReadOnly();
        Assert.IsAssignableFrom<IEmailBlock>(new HeroBlock("u", "h"));
        Assert.IsAssignableFrom<IEmailBlock>(new TextBlock("t"));
        Assert.IsAssignableFrom<IEmailBlock>(new ButtonBlock("l", "u"));
        Assert.IsAssignableFrom<IEmailBlock>(new ImageBlock("u", "a"));
        Assert.IsAssignableFrom<IEmailBlock>(new DividerBlock());
        Assert.IsAssignableFrom<IEmailBlock>(new TwoColumnBlock(emptyList, emptyList));
    }
}
