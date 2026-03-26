using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace EmailEditor.Tests.Api;

public class GenerateEndpointTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public GenerateEndpointTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    private static object FullDocument() => new
    {
        blocks = new object[]
        {
            new { type = "hero", imageUrl = "https://img.url/banner.jpg", headline = "Hello" },
            new { type = "text", htmlContent = "<p>Body text</p>" },
            new { type = "button", label = "Click", url = "https://example.com", backgroundColor = "#000000", textColor = "#ffffff" },
            new { type = "image", imageUrl = "https://img.url/photo.jpg", altText = "Photo" },
            new { type = "divider" },
            new { type = "columns",
                column0 = new object[] { new { type = "text", htmlContent = "<p>Left</p>" } },
                column1 = new object[] { new { type = "text", htmlContent = "<p>Right</p>" } } },
            new { type = "header", text = "Section", level = 1, alignment = "center" },
        }
    };

    [Fact]
    public async Task PostGenerate_WithValidDocument_Returns200()
    {
        var response = await _client.PostAsJsonAsync("/api/generate", FullDocument());
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task PostGenerate_WithValidDocument_ReturnsHtmlContentType()
    {
        var response = await _client.PostAsJsonAsync("/api/generate", FullDocument());
        Assert.Equal("text/html", response.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task PostGenerate_WithValidDocument_ReturnsHtmlDoctype()
    {
        var response = await _client.PostAsJsonAsync("/api/generate", FullDocument());
        var html = await response.Content.ReadAsStringAsync();
        Assert.Contains("<!DOCTYPE html", html);
    }

    [Fact]
    public async Task PostGenerate_WithValidDocument_RendersAllBlocks()
    {
        var response = await _client.PostAsJsonAsync("/api/generate", FullDocument());
        var html = await response.Content.ReadAsStringAsync();
        Assert.Contains("Hello", html);          // hero headline
        Assert.Contains("Body text", html);       // text block
        Assert.Contains("Click", html);           // button label
        Assert.Contains("Photo", html);           // image alt
        Assert.Contains("<hr", html);             // divider
        Assert.Contains("Left", html);            // two-column
        Assert.Contains("Right", html);
    }

    [Fact]
    public async Task PostGenerate_WithEmptyBody_Returns400()
    {
        var response = await _client.PostAsync("/api/generate",
            new StringContent("", System.Text.Encoding.UTF8, "application/json"));
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task PostGenerate_WithMalformedJson_Returns400()
    {
        var response = await _client.PostAsync("/api/generate",
            new StringContent("{ not valid json }", System.Text.Encoding.UTF8, "application/json"));
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task PostGenerate_ColumnsWithNestedBlocksInBothColumns_RendersAllContent()
    {
        var doc = new
        {
            blocks = new object[]
            {
                new
                {
                    type = "columns",
                    column0 = new object[]
                    {
                        new { type = "text", htmlContent = "<p>LeftText</p>" },
                        new { type = "image", imageUrl = "https://img.url/left.jpg", altText = "left photo" }
                    },
                    column1 = new object[]
                    {
                        new { type = "button", label = "RightBtn", url = "https://right.com",
                              backgroundColor = "#000000", textColor = "#ffffff" }
                    }
                }
            }
        };
        var response = await _client.PostAsJsonAsync("/api/generate", doc);
        var html = await response.Content.ReadAsStringAsync();
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Contains("LeftText", html);
        Assert.Contains("https://img.url/left.jpg", html);
        Assert.Contains("left photo", html);
        Assert.Contains("RightBtn", html);
        Assert.Contains("https://right.com", html);
        Assert.Contains("50%", html);   // two-column structure present
    }

    [Fact]
    public async Task PostGenerate_ColumnsWithArrayFormat_RendersAllContent()
    {
        // Validates the natural JSON.stringify format from the frontend
        var doc = new
        {
            blocks = new object[]
            {
                new
                {
                    type = "columns",
                    columns = new object[][]
                    {
                        new object[] { new { type = "text", htmlContent = "<p>ColA</p>" } },
                        new object[] { new { type = "text", htmlContent = "<p>ColB</p>" } },
                        new object[] { new { type = "text", htmlContent = "<p>ColC</p>" } },
                    }
                }
            }
        };
        var response = await _client.PostAsJsonAsync("/api/generate", doc);
        var html = await response.Content.ReadAsStringAsync();
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Contains("ColA", html);
        Assert.Contains("ColB", html);
        Assert.Contains("ColC", html);
        Assert.Contains("33%", html);   // three-column width
    }

    [Fact]
    public async Task PostGenerate_WithMergeData_ResolvesTokensInOutput()
    {
        var doc = new
        {
            mergeData = new { person = new { name = "Alice" }, company = "Acme" },
            blocks = new object[]
            {
                new { type = "hero", imageUrl = "https://img.url/x.jpg", headline = "Hello {{person.name}}" },
                new { type = "text", htmlContent = "<p>Welcome to {{company}}</p>" },
                new { type = "button", label = "Hi {{person.name}}", url = "https://x.com" },
                new { type = "image", imageUrl = "https://img.url/x.jpg", altText = "{{person.name}} photo" },
                new { type = "header", text = "Dear {{person.name}}", level = 1, alignment = "left" },
            }
        };
        var response = await _client.PostAsJsonAsync("/api/generate", doc);
        var html = await response.Content.ReadAsStringAsync();
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Contains("Hello Alice", html);
        Assert.Contains("Welcome to Acme", html);
        Assert.Contains("Hi Alice", html);
        Assert.Contains("Alice photo", html);
        Assert.Contains("Dear Alice", html);
        Assert.DoesNotContain("{{person.name}}", html);
        Assert.DoesNotContain("{{company}}", html);
    }

    [Fact]
    public async Task PostGenerate_WithoutMergeData_RawTokensPassThrough()
    {
        var doc = new
        {
            blocks = new object[]
            {
                new { type = "text", htmlContent = "<p>Hello {{person.name}}</p>" }
            }
        };
        var response = await _client.PostAsJsonAsync("/api/generate", doc);
        var html = await response.Content.ReadAsStringAsync();
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Contains("{{person.name}}", html);
    }

    [Fact]
    public async Task PostGenerate_WithMergeData_ColumnsNestedBlocksResolved()
    {
        var doc = new
        {
            mergeData = new { col = new { left = "LeftVal", right = "RightVal" } },
            blocks = new object[]
            {
                new
                {
                    type = "columns",
                    column0 = new object[] { new { type = "text", htmlContent = "<p>{{col.left}}</p>" } },
                    column1 = new object[] { new { type = "text", htmlContent = "<p>{{col.right}}</p>" } }
                }
            }
        };
        var response = await _client.PostAsJsonAsync("/api/generate", doc);
        var html = await response.Content.ReadAsStringAsync();
        Assert.Contains("LeftVal", html);
        Assert.Contains("RightVal", html);
    }

    [Fact]
    public async Task PostGenerate_ScriptInTextBlock_IsSanitized()
    {
        var doc = new
        {
            blocks = new object[]
            {
                new { type = "text", htmlContent = "<script>alert('xss')</script><p>Safe</p>" }
            }
        };
        var response = await _client.PostAsJsonAsync("/api/generate", doc);
        var html = await response.Content.ReadAsStringAsync();
        Assert.DoesNotContain("<script>", html);
        Assert.Contains("Safe", html);
    }
}
