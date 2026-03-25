using System.Text;
using EmailEditor.Models;

namespace EmailEditor.Services;

public class HtmlGeneratorService
{
    public string Generate(EmailDocument doc)
    {
        var sb = new StringBuilder();

        sb.AppendLine("<!DOCTYPE html>");
        sb.AppendLine("<html lang=\"en\">");
        sb.AppendLine("<head>");
        sb.AppendLine("<meta charset=\"UTF-8\">");
        sb.AppendLine("<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">");
        sb.AppendLine("<meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">");
        sb.AppendLine("</head>");
        sb.AppendLine("<body style=\"margin:0;padding:0;background-color:#f4f4f4;\">");

        // Preview text trick — invisible text shown in inbox snippet
        if (!string.IsNullOrEmpty(doc.PreviewText))
        {
            sb.AppendLine($"<div style=\"display:none;max-height:0;overflow:hidden;font-size:1px;color:#ffffff;\">{HtmlEncode(doc.PreviewText)}&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;</div>");
        }

        // Outer centering table
        sb.AppendLine("<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"background-color:#f4f4f4;\">");
        sb.AppendLine("<tr>");
        sb.AppendLine("<td align=\"center\">");

        // Inner content table (600px)
        sb.AppendLine("<table width=\"600\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"background-color:#ffffff;\">");

        foreach (var block in doc.Blocks)
        {
            sb.AppendLine(RenderBlock(block));
        }

        sb.AppendLine("</table>");
        sb.AppendLine("</td>");
        sb.AppendLine("</tr>");
        sb.AppendLine("</table>");

        sb.AppendLine("</body>");
        sb.AppendLine("</html>");

        return sb.ToString();
    }

    private static string RenderBlock(IEmailBlock block) => block switch
    {
        HeroBlock hero         => RenderHero(hero),
        TextBlock text         => RenderText(text),
        ButtonBlock button     => RenderButton(button),
        ImageBlock image       => RenderImage(image),
        DividerBlock divider   => RenderDivider(divider),
        TwoColumnBlock twoCol  => RenderTwoColumn(twoCol),
        _                      => string.Empty
    };

    private static string RenderHero(HeroBlock block)
    {
        var sb = new StringBuilder();
        sb.AppendLine("<tr>");
        sb.AppendLine("<td style=\"padding:0;\">");
        sb.AppendLine($"<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">");
        sb.AppendLine("<tr>");
        sb.AppendLine($"<td style=\"padding:0;\">");
        sb.AppendLine($"<img src=\"{HtmlEncode(block.ImageUrl)}\" width=\"600\" style=\"display:block;width:100%;max-width:600px;\" alt=\"\">");
        sb.AppendLine("</td>");
        sb.AppendLine("</tr>");
        sb.AppendLine("<tr>");
        sb.AppendLine($"<td style=\"padding:24px 32px;font-family:Arial,sans-serif;font-size:28px;font-weight:bold;color:#1a1a1a;\">");
        sb.AppendLine(HtmlEncode(block.Headline));
        sb.AppendLine("</td>");
        sb.AppendLine("</tr>");
        sb.AppendLine("</table>");
        sb.AppendLine("</td>");
        sb.AppendLine("</tr>");
        return sb.ToString();
    }

    private static string RenderText(TextBlock block)
    {
        var sb = new StringBuilder();
        sb.AppendLine("<tr>");
        sb.AppendLine($"<td style=\"padding:16px 32px;font-family:Arial,sans-serif;font-size:16px;color:#333333;line-height:1.6;\">");
        sb.AppendLine(block.HtmlContent); // Quill HTML — sanitized at API boundary
        sb.AppendLine("</td>");
        sb.AppendLine("</tr>");
        return sb.ToString();
    }

    private static string RenderButton(ButtonBlock block)
    {
        var sb = new StringBuilder();
        sb.AppendLine("<tr>");
        sb.AppendLine("<td style=\"padding:24px 32px;\" align=\"center\">");
        sb.AppendLine("<table cellpadding=\"0\" cellspacing=\"0\" border=\"0\">");
        sb.AppendLine("<tr>");
        sb.AppendLine($"<td style=\"background-color:{HtmlEncode(block.BackgroundColor)};border-radius:4px;\" align=\"center\">");
        sb.AppendLine($"<!--[if mso]><v:roundrect xmlns:v=\"urn:schemas-microsoft-com:vml\" href=\"{HtmlEncode(block.Url)}\" style=\"height:44px;v-text-anchor:middle;width:200px;\" arcsize=\"5%\" strokecolor=\"{HtmlEncode(block.BackgroundColor)}\" fillcolor=\"{HtmlEncode(block.BackgroundColor)}\"><v:textbox inset=\"0px,0px,0px,0px\"><center style=\"color:{HtmlEncode(block.TextColor)};font-family:Arial,sans-serif;font-size:16px;\">{HtmlEncode(block.Label)}</center></v:textbox></v:roundrect><![endif]-->");
        sb.AppendLine($"<!--[if !mso]><!-->");
        sb.AppendLine($"<a href=\"{HtmlEncode(block.Url)}\" style=\"display:inline-block;padding:12px 32px;background-color:{HtmlEncode(block.BackgroundColor)};color:{HtmlEncode(block.TextColor)};font-family:Arial,sans-serif;font-size:16px;font-weight:bold;text-decoration:none;border-radius:4px;\">{HtmlEncode(block.Label)}</a>");
        sb.AppendLine("<!--<![endif]-->");
        sb.AppendLine("</td>");
        sb.AppendLine("</tr>");
        sb.AppendLine("</table>");
        sb.AppendLine("</td>");
        sb.AppendLine("</tr>");
        return sb.ToString();
    }

    private static string RenderImage(ImageBlock block)
    {
        var sb = new StringBuilder();
        sb.AppendLine("<tr>");
        sb.AppendLine("<td style=\"padding:16px 32px;\">");
        sb.AppendLine($"<img src=\"{HtmlEncode(block.ImageUrl)}\" alt=\"{HtmlEncode(block.AltText)}\" width=\"536\" style=\"display:block;width:100%;max-width:536px;\">");
        sb.AppendLine("</td>");
        sb.AppendLine("</tr>");
        return sb.ToString();
    }

    private static string RenderDivider(DividerBlock _)
    {
        var sb = new StringBuilder();
        sb.AppendLine("<tr>");
        sb.AppendLine("<td style=\"padding:16px 32px;\">");
        sb.AppendLine("<hr style=\"border:none;border-top:1px solid #e0e0e0;margin:0;\">");
        sb.AppendLine("</td>");
        sb.AppendLine("</tr>");
        return sb.ToString();
    }

    private static string RenderTwoColumn(TwoColumnBlock block)
    {
        var sb = new StringBuilder();
        sb.AppendLine("<tr>");
        sb.AppendLine("<td style=\"padding:16px 32px;\">");
        sb.AppendLine("<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">");
        sb.AppendLine("<tr>");

        // Left column
        sb.AppendLine("<td width=\"50%\" valign=\"top\" style=\"padding-right:8px;\">");
        sb.AppendLine("<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">");
        foreach (var child in block.LeftBlocks)
            sb.AppendLine(RenderBlock(child));
        sb.AppendLine("</table>");
        sb.AppendLine("</td>");

        // Right column
        sb.AppendLine("<td width=\"50%\" valign=\"top\" style=\"padding-left:8px;\">");
        sb.AppendLine("<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">");
        foreach (var child in block.RightBlocks)
            sb.AppendLine(RenderBlock(child));
        sb.AppendLine("</table>");
        sb.AppendLine("</td>");

        sb.AppendLine("</tr>");
        sb.AppendLine("</table>");
        sb.AppendLine("</td>");
        sb.AppendLine("</tr>");
        return sb.ToString();
    }

    private static string HtmlEncode(string value) =>
        System.Net.WebUtility.HtmlEncode(value);
}
