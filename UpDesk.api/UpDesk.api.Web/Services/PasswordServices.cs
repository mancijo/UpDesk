// Local do arquivo: Services/PasswordService.cs

using Scrypt; // Importa a nova biblioteca
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

    // --- FUNÇÃO DE VERIFICAÇÃO DO SCRYPT (FORMATO ANTIGO DO PYTHON) ---
    public static bool VerifyScryptPassword(string password, string scryptHash)
    {
        // O formato do Werkzeug/Python é: "scrypt:n:r:p$salt$hash"
        // O formato da biblioteca Scrypt.NET é um pouco diferente, então precisamos
        // apenas do hash completo que já inclui todos os parâmetros.

        try
        {
            var encoder = new ScryptEncoder();
            return encoder.Compare(password, scryptHash);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Erro ao verificar hash Scrypt: {ex.Message}");
            return false;
        }
    }
}