using EmailEditor.Services;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton<HtmlGeneratorService>();
var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

// SPA fallback: serve index.html for non-API routes
app.MapFallbackToFile("index.html");

app.Run();
