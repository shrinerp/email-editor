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
        subject = "Test Subject",
        previewText = "Preview snippet",
        fromName = "Sender",
        fromAddress = "sender@example.com",
        blocks = new object[]
        {
            new { type = "hero", imageUrl = "https://img.url/banner.jpg", headline = "Hello" },
            new { type = "text", htmlContent = "<p>Body text</p>" },
            new { type = "button", label = "Click", url = "https://example.com", backgroundColor = "#000000", textColor = "#ffffff" },
            new { type = "image", imageUrl = "https://img.url/photo.jpg", altText = "Photo" },
            new { type = "divider" },
            new { type = "twoColumn", leftHtmlContent = "<p>Left</p>", rightHtmlContent = "<p>Right</p>" },
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
    public async Task PostGenerate_ScriptInTextBlock_IsSanitized()
    {
        var doc = new
        {
            subject = "S",
            previewText = "P",
            fromName = "F",
            fromAddress = "f@f.com",
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
