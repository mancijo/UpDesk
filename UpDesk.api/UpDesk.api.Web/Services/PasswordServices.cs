// Local do arquivo: Services/PasswordService.cs

using System.Security.Cryptography;
using System.Text;

namespace UpDesk.Api.Services;

public static class PasswordService
{
    // --- FUNÇÕES DO BCRYPT (NOVO FORMATO) ---
    public static string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password);
    }

    public static bool VerifyPassword(string password, string hashedPassword)
    {
        return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
    }
}