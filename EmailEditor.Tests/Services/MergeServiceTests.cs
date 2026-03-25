using System.Text.Json;
using EmailEditor.Services;

namespace EmailEditor.Tests.Services;

public class MergeServiceTests
{
    [Fact]
    public void Resolve_SingleToken_ReturnsReplacedValue()
    {
        var data = JsonDocument.Parse("""{"name":"Alice"}""").RootElement;
        var result = MergeService.Resolve("Hello {{name}}", data);
        Assert.Equal("Hello Alice", result);
    }

    [Fact]
    public void Resolve_NestedTwoLevels_ReturnsReplacedValue()
    {
        var data = JsonDocument.Parse("""{"person":{"firstName":"Bob"}}""").RootElement;
        var result = MergeService.Resolve("Hi {{person.firstName}}", data);
        Assert.Equal("Hi Bob", result);
    }

    [Fact]
    public void Resolve_NestedThreeLevels_ReturnsReplacedValue()
    {
        var data = JsonDocument.Parse("""{"order":{"address":{"city":"Portland"}}}""").RootElement;
        var result = MergeService.Resolve("Ship to {{order.address.city}}", data);
        Assert.Equal("Ship to Portland", result);
    }

    [Fact]
    public void Resolve_MissingKey_ReturnsBlank()
    {
        var data = JsonDocument.Parse("""{"name":"Alice"}""").RootElement;
        var result = MergeService.Resolve("Hello {{missing.key}}", data);
        Assert.Equal("Hello ", result);
    }

    [Fact]
    public void Resolve_EmptyJsonElement_ReturnsInputUnchanged()
    {
        var data = default(JsonElement);
        var result = MergeService.Resolve("Hello {{name}}", data);
        Assert.Equal("Hello {{name}}", result);
    }

    [Fact]
    public void Resolve_MultipleTokens_ReplacesAll()
    {
        var data = JsonDocument.Parse("""{"first":"Jane","last":"Doe"}""").RootElement;
        var result = MergeService.Resolve("{{first}} {{last}}", data);
        Assert.Equal("Jane Doe", result);
    }

    [Fact]
    public void Resolve_SpecialCharsInValue_PreservesChars()
    {
        var data = JsonDocument.Parse("""{"msg":"Hello & <World>"}""").RootElement;
        var result = MergeService.Resolve("{{msg}}", data);
        Assert.Equal("Hello & <World>", result);
    }

    [Fact]
    public void Resolve_NoTokensInTemplate_ReturnsUnchanged()
    {
        var data = JsonDocument.Parse("""{"name":"Alice"}""").RootElement;
        var result = MergeService.Resolve("No tokens here", data);
        Assert.Equal("No tokens here", result);
    }

    [Fact]
    public void Resolve_EmptyTemplate_ReturnsEmpty()
    {
        var data = JsonDocument.Parse("""{"name":"Alice"}""").RootElement;
        var result = MergeService.Resolve("", data);
        Assert.Equal("", result);
    }

    [Fact]
    public void Resolve_TokenValueIsNumber_ReturnsStringRepresentation()
    {
        var data = JsonDocument.Parse("""{"count":42}""").RootElement;
        var result = MergeService.Resolve("Count: {{count}}", data);
        Assert.Equal("Count: 42", result);
    }

    [Fact]
    public void Resolve_PathPointsToObject_ReturnsBlank()
    {
        var data = JsonDocument.Parse("""{"person":{"name":"Alice"}}""").RootElement;
        var result = MergeService.Resolve("{{person}}", data);
        Assert.Equal("", result);
    }
}
