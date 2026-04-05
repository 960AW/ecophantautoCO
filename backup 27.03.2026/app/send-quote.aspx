<%@ Page Language="C#" %>
<%@ Import Namespace="System" %>
<%@ Import Namespace="System.Collections.Generic" %>
<%@ Import Namespace="System.IO" %>
<%@ Import Namespace="System.Linq" %>
<%@ Import Namespace="System.Net" %>
<%@ Import Namespace="System.Net.Mail" %>
<%@ Import Namespace="System.Web" %>
<%@ Import Namespace="System.Web.Script.Serialization" %>
<script runat="server">
    protected void Page_Load(object sender, EventArgs e)
    {
        Response.ContentType = "application/json";
        Response.Cache.SetCacheability(System.Web.HttpCacheability.NoCache);

        if (!Request.HttpMethod.Equals("POST", StringComparison.OrdinalIgnoreCase))
        {
            WriteJson(false, "Metodo no permitido.", 405);
            return;
        }

        try
        {
            string fullName = (Request.Form["fullName"] ?? string.Empty).Trim();
            string phone = (Request.Form["phone"] ?? string.Empty).Trim();
            string email = (Request.Form["email"] ?? string.Empty).Trim();
            string make = (Request.Form["make"] ?? string.Empty).Trim();
            string model = (Request.Form["model"] ?? string.Empty).Trim();
            string year = (Request.Form["year"] ?? string.Empty).Trim();
            string color = (Request.Form["color"] ?? string.Empty).Trim();
            string message = (Request.Form["message"] ?? string.Empty).Trim();
            string[] services = Request.Form.GetValues("services") ?? new string[0];

            if (string.IsNullOrWhiteSpace(fullName) ||
                string.IsNullOrWhiteSpace(phone) ||
                string.IsNullOrWhiteSpace(email) ||
                string.IsNullOrWhiteSpace(make) ||
                string.IsNullOrWhiteSpace(model) ||
                string.IsNullOrWhiteSpace(year) ||
                string.IsNullOrWhiteSpace(color) ||
                services.Length == 0)
            {
                WriteJson(false, "Completa los campos requeridos.", 400);
                return;
            }

            var allowedExtensions = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                ".jpg", ".jpeg", ".png", ".heic", ".heif", ".webp", ".mp4", ".mov"
            };

            var streams = new List<MemoryStream>();
            var attachments = new List<Attachment>();

            try
            {
                for (int i = 0; i < Request.Files.Count; i++)
                {
                    HttpPostedFile file = Request.Files[i];
                    if (file == null || file.ContentLength <= 0) continue;

                    string extension = Path.GetExtension(file.FileName ?? string.Empty);
                    if (!allowedExtensions.Contains(extension))
                    {
                        WriteJson(false, "Uno de los archivos no tiene un formato permitido.", 400);
                        return;
                    }

                    if (file.ContentLength > 20 * 1024 * 1024)
                    {
                        WriteJson(false, "Cada archivo debe pesar menos de 20 MB.", 400);
                        return;
                    }

                    var stream = new MemoryStream();
                    file.InputStream.CopyTo(stream);
                    stream.Position = 0;
                    streams.Add(stream);

                    var attachment = new Attachment(stream, Path.GetFileName(file.FileName), string.IsNullOrWhiteSpace(file.ContentType) ? "application/octet-stream" : file.ContentType);
                    attachments.Add(attachment);
                }

                var fromAddress = new MailAddress("jose@960agenciaweb.com", "Ecophant Auto Web");
                var toAddress = new MailAddress("jvillamizar@ecophantauto.com.co", "Juan Carlos Villamizar");

                using (var mail = new MailMessage())
                {
                    mail.From = fromAddress;
                    mail.To.Add(toAddress);
                    mail.ReplyToList.Add(new MailAddress(email, fullName));
                    mail.Subject = "Nueva solicitud de cotizacion - Ecophant Auto";
                    mail.IsBodyHtml = true;

                    foreach (var attachment in attachments)
                    {
                        mail.Attachments.Add(attachment);
                    }

                    string servicesText = string.Join(", ", services.Where(s => !string.IsNullOrWhiteSpace(s)).Select(s => s.Trim()));
                    string safeMessage = string.IsNullOrWhiteSpace(message) ? "Sin mensaje adicional." : Server.HtmlEncode(message).Replace(Environment.NewLine, "<br>").Replace("\n", "<br>");
                    string attachmentNote = attachments.Count > 0 ? string.Format("<p><strong>Adjuntos:</strong> {0}</p>", attachments.Count) : "<p><strong>Adjuntos:</strong> No se enviaron archivos.</p>";

                    mail.Body = string.Format(@"
                        <div style='font-family:Arial,sans-serif;font-size:15px;color:#111'>
                          <h2 style='margin:0 0 16px'>Nueva solicitud de cotizacion</h2>
                          <p><strong>Nombre:</strong> {0}</p>
                          <p><strong>Telefono:</strong> {1}</p>
                          <p><strong>Correo:</strong> {2}</p>
                          <p><strong>Vehiculo:</strong> {3} {4} / {5} / {6}</p>
                          <p><strong>Servicio(s):</strong> {7}</p>
                          {8}
                          <p><strong>Mensaje:</strong><br>{9}</p>
                        </div>
                    ",
                        Server.HtmlEncode(fullName),
                        Server.HtmlEncode(phone),
                        Server.HtmlEncode(email),
                        Server.HtmlEncode(make),
                        Server.HtmlEncode(model),
                        Server.HtmlEncode(year),
                        Server.HtmlEncode(color),
                        Server.HtmlEncode(servicesText),
                        attachmentNote,
                        safeMessage
                    );

                    using (var smtp = new SmtpClient("host.960servidor.com", 465))
                    {
                        smtp.EnableSsl = true;
                        smtp.DeliveryMethod = SmtpDeliveryMethod.Network;
                        smtp.UseDefaultCredentials = false;
                        smtp.Credentials = new NetworkCredential("jose@960agenciaweb.com", "U2one1973/./");
                        smtp.Send(mail);
                    }
                }
            }
            finally
            {
                foreach (var attachment in attachments)
                {
                    attachment.Dispose();
                }

                foreach (var stream in streams)
                {
                    stream.Dispose();
                }
            }

            WriteJson(true, "Solicitud enviada.", 200);
        }
        catch (Exception)
        {
            WriteJson(false, "No fue posible enviar la solicitud en este momento.", 500);
        }
    }

    private void WriteJson(bool success, string message, int statusCode)
    {
        Response.StatusCode = statusCode;
        var serializer = new JavaScriptSerializer();
        Response.Write(serializer.Serialize(new { success = success, message = message }));
        Response.End();
    }
</script>
