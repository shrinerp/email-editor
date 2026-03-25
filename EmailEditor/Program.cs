using System.Text.Json;
using EmailEditor.Api;
using EmailEditor.Services;
using Ganss.Xss;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton<HtmlGeneratorService>();
builder.Services.AddSingleton<HtmlSanitizer>();
var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

// POST /api/generate — accepts EmailDocument JSON, returns cross-client HTML
app.MapPost("/api/generate", (HttpContext ctx, HtmlGeneratorService generator, HtmlSanitizer sanitizer) =>
{
    EmailDocumentDto? dto;
    try
    {
        dto = ctx.Request.ReadFromJsonAsync<EmailDocumentDto>().GetAwaiter().GetResult();
    }
    catch
    {
        return Results.BadRequest("Invalid JSON");
    }

    if (dto is null)
        return Results.BadRequest("Request body is required");

    var doc = dto.ToEmailDocument(html => sanitizer.Sanitize(html));

    if (dto.MergeData is { } mergeData && mergeData.ValueKind != System.Text.Json.JsonValueKind.Undefined)
        doc = EmailDocumentDtoExtensions.ApplyMerge(doc, mergeData);

    var html = generator.Generate(doc);

    return Results.Content(html, "text/html");
});

// SPA fallback: serve index.html for non-API routes
app.MapFallbackToFile("index.html");

app.Run();

// Required for WebApplicationFactory in integration tests
public partial class Program { }
