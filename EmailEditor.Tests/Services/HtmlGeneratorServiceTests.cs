using EmailEditor.Models;
using EmailEditor.Services;

namespace EmailEditor.Tests.Services;

public class HtmlGeneratorServiceTests
{
    private readonly HtmlGeneratorService _sut = new();

    private static EmailDocument DocWith(params IEmailBlock[] blocks) =>
        new(blocks.ToList().AsReadOnly());

    // ── Document structure ────────────────────────────────────────────────

    [Fact]
    public void Generate_ReturnsDoctype()
    {
        var html = _sut.Generate(DocWith());
        Assert.Contains("<!DOCTYPE html", html);
    }

    [Fact]
    public void Generate_ReturnsHtmlHeadBody()
    {
        var html = _sut.Generate(DocWith());
        Assert.Contains("<html", html);
        Assert.Contains("<head>", html);
        Assert.Contains("<body", html);
    }

    [Fact]
    public void Generate_UsesOuterCenteringTable()
    {
        var html = _sut.Generate(DocWith());
        // Outer 100% table with centered alignment
        Assert.Contains("width=\"100%\"", html);
        Assert.Contains("align=\"center\"", html);
    }

    [Fact]
    public void Generate_EmptyBlocksProducesValidDocument()
    {
        var html = _sut.Generate(DocWith());
        Assert.Contains("</html>", html);
    }

    // ── HeroBlock ─────────────────────────────────────────────────────────

    [Fact]
    public void Generate_HeroBlock_ContainsImage()
    {
        var html = _sut.Generate(DocWith(new HeroBlock("https://img.url/banner.jpg", "Big Headline")));
        Assert.Contains("https://img.url/banner.jpg", html);
        Assert.Contains("<img", html);
    }

    [Fact]
    public void Generate_HeroBlock_ContainsHeadline()
    {
        var html = _sut.Generate(DocWith(new HeroBlock("https://img.url/banner.jpg", "Big Headline")));
        Assert.Contains("Big Headline", html);
    }

    [Fact]
    public void Generate_HeroBlock_UsesTableLayout()
    {
        var html = _sut.Generate(DocWith(new HeroBlock("https://img.url/banner.jpg", "Headline")));
        Assert.Contains("<table", html);
        Assert.DoesNotContain("display:flex", html);
        Assert.DoesNotContain("display:grid", html);
    }

    // ── TextBlock ─────────────────────────────────────────────────────────

    [Fact]
    public void Generate_TextBlock_ContainsHtmlContent()
    {
        var html = _sut.Generate(DocWith(new TextBlock("<p>Hello <strong>world</strong></p>")));
        Assert.Contains("Hello", html);
        Assert.Contains("world", html);
    }

    [Fact]
    public void Generate_TextBlock_EmptyContent_DoesNotThrow()
    {
        var html = _sut.Generate(DocWith(new TextBlock("")));
        Assert.Contains("</html>", html);
    }

    [Fact]
    public void Generate_TextBlock_SpecialCharsPreserved()
    {
        var html = _sut.Generate(DocWith(new TextBlock("<p>Test &amp; more</p>")));
        Assert.Contains("&amp;", html);
    }

    // ── ButtonBlock ───────────────────────────────────────────────────────

    [Fact]
    public void Generate_ButtonBlock_ContainsLabel()
    {
        var html = _sut.Generate(DocWith(new ButtonBlock("Click Me", "https://example.com")));
        Assert.Contains("Click Me", html);
    }

    [Fact]
    public void Generate_ButtonBlock_ContainsUrl()
    {
        var html = _sut.Generate(DocWith(new ButtonBlock("Click", "https://example.com/landing")));
        Assert.Contains("https://example.com/landing", html);
    }

    [Fact]
    public void Generate_ButtonBlock_UsesBackgroundColor()
    {
        var html = _sut.Generate(DocWith(new ButtonBlock("Click", "https://example.com", "#ff0000", "#ffffff")));
        Assert.Contains("#ff0000", html);
    }

    [Fact]
    public void Generate_ButtonBlock_UsesTextColor()
    {
        var html = _sut.Generate(DocWith(new ButtonBlock("Click", "https://example.com", "#000000", "#00ff00")));
        Assert.Contains("#00ff00", html);
    }

    [Fact]
    public void Generate_ButtonBlock_NoButtonElement()
    {
        // Must use table cell, not <button>, for Outlook compatibility
        var html = _sut.Generate(DocWith(new ButtonBlock("Click", "https://example.com")));
        Assert.DoesNotContain("<button", html);
    }

    [Fact]
    public void Generate_ButtonBlock_UsesAnchorTag()
    {
        var html = _sut.Generate(DocWith(new ButtonBlock("Click", "https://example.com")));
        Assert.Contains("<a ", html);
        Assert.Contains("href=", html);
    }

    // ── ImageBlock ────────────────────────────────────────────────────────

    [Fact]
    public void Generate_ImageBlock_ContainsSrc()
    {
        var html = _sut.Generate(DocWith(new ImageBlock("https://img.url/photo.jpg", "A photo")));
        Assert.Contains("https://img.url/photo.jpg", html);
    }

    [Fact]
    public void Generate_ImageBlock_ContainsAltText()
    {
        var html = _sut.Generate(DocWith(new ImageBlock("https://img.url/photo.jpg", "A photo")));
        Assert.Contains("A photo", html);
    }

    [Fact]
    public void Generate_ImageBlock_HasDisplayBlock()
    {
        var html = _sut.Generate(DocWith(new ImageBlock("https://img.url/photo.jpg", "alt")));
        Assert.Contains("display:block", html);
    }

    // ── DividerBlock ──────────────────────────────────────────────────────

    [Fact]
    public void Generate_DividerBlock_ContainsHr()
    {
        var html = _sut.Generate(DocWith(new DividerBlock()));
        Assert.Contains("<hr", html);
    }

    [Fact]
    public void Generate_DividerBlock_HasBorderNone()
    {
        var html = _sut.Generate(DocWith(new DividerBlock()));
        Assert.Contains("border:none", html);
    }

    // ── ColumnsBlock ───────────────────────────────────────────────────────

    private static ColumnsBlock Cols(params string[] texts) =>
        new(texts
            .Select(t => (IReadOnlyList<IEmailBlock>)new List<IEmailBlock> { new TextBlock($"<p>{t}</p>") }.AsReadOnly())
            .ToList()
            .AsReadOnly());

    [Fact]
    public void Generate_ColumnsBlock_TwoColumns_RendersBothColumns()
    {
        var html = _sut.Generate(DocWith(Cols("Left", "Right")));
        Assert.Contains("Left", html);
        Assert.Contains("Right", html);
    }

    [Fact]
    public void Generate_ColumnsBlock_TwoColumns_UsesFiftyPercentWidth()
    {
        var html = _sut.Generate(DocWith(Cols("L", "R")));
        Assert.Contains("50%", html);
    }

    [Fact]
    public void Generate_ColumnsBlock_ThreeColumns_UsesThirtyThreePercentWidth()
    {
        var html = _sut.Generate(DocWith(Cols("A", "B", "C")));
        Assert.Contains("33%", html);
    }

    [Fact]
    public void Generate_ColumnsBlock_UsesTableLayout()
    {
        var html = _sut.Generate(DocWith(Cols("L", "R")));
        Assert.Contains("<table", html);
        Assert.DoesNotContain("display:flex", html);
        Assert.DoesNotContain("display:grid", html);
    }

    [Fact]
    public void Generate_ColumnsBlock_ChildBlocksRenderedInCorrectColumn()
    {
        var block = new ColumnsBlock(new List<IReadOnlyList<IEmailBlock>>
        {
            new List<IEmailBlock> { new TextBlock("<p>LeftContent</p>") }.AsReadOnly(),
            new List<IEmailBlock> { new ButtonBlock("RightBtn", "https://right.com") }.AsReadOnly(),
        }.AsReadOnly());
        var html = _sut.Generate(DocWith(block));
        Assert.Contains("LeftContent", html);
        Assert.Contains("RightBtn", html);
        Assert.Contains("https://right.com", html);
    }

    [Fact]
    public void Generate_ColumnsBlock_EmptyColumnsDoNotThrow()
    {
        var block = new ColumnsBlock(new List<IReadOnlyList<IEmailBlock>>
        {
            new List<IEmailBlock>().AsReadOnly(),
            new List<IEmailBlock>().AsReadOnly(),
        }.AsReadOnly());
        var html = _sut.Generate(DocWith(block));
        Assert.Contains("</html>", html);
    }

    // ── No style blocks ───────────────────────────────────────────────────

    [Fact]
    public void Generate_AllBlocks_NoStyleTags()
    {
        var html = _sut.Generate(DocWith(
            new HeroBlock("https://img.url", "H"),
            new TextBlock("<p>T</p>"),
            new ButtonBlock("B", "https://url.com"),
            new ImageBlock("https://img.url", "alt"),
            new DividerBlock(),
            Cols("L", "R")
        ));
        Assert.DoesNotContain("<style>", html);
        Assert.DoesNotContain("<style ", html);
    }

    // ── HeaderBlock ───────────────────────────────────────────────────────

    [Fact]
    public void Generate_HeaderBlock_ContainsText()
    {
        var html = _sut.Generate(DocWith(new HeaderBlock("Welcome to Acme", 1, "left")));
        Assert.Contains("Welcome to Acme", html);
    }

    [Fact]
    public void Generate_HeaderBlock_UsesCorrectHeadingTag()
    {
        var html = _sut.Generate(DocWith(new HeaderBlock("Section Title", 2, "center")));
        Assert.Contains("<h2", html);
        Assert.Contains("</h2>", html);
    }

    [Fact]
    public void Generate_HeaderBlock_UsesTableLayout()
    {
        var html = _sut.Generate(DocWith(new HeaderBlock("Title", 1, "left")));
        Assert.Contains("<tr>", html);
        Assert.Contains("<td", html);
        Assert.DoesNotContain("display:flex", html);
        Assert.DoesNotContain("display:grid", html);
    }

    [Fact]
    public void Generate_HeaderBlock_AppliesAlignment()
    {
        var html = _sut.Generate(DocWith(new HeaderBlock("Title", 1, "center")));
        Assert.Contains("text-align:center", html);
    }
}
