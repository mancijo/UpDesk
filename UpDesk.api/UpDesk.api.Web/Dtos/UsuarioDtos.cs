using System.ComponentModel.DataAnnotations;

namespace UpDesk.Api.Dtos;

// DTO para login
public record LoginRequestDto([Required] string Email, [Required] string Senha);

// DTO para resposta do login e consulta de usuário
public record UsuarioDto(int Id, string Nome, string Email, string? Telefone, string? Setor, string Cargo);

// DTO para criar um novo usuário
public record CreateUsuarioDto(
    [Required] string Nome,
    [Required][EmailAddress] string Email,
    string? Telefone,
    string? Setor,
    [Required] string Cargo,
    [Required][MinLength(6)] string Senha
);

// DTO para atualizar um usuário
public record UpdateUsuarioDto(
    [Required] string Nome,
    [Required][EmailAddress] string Email,
    string? Telefone,
    string? Setor,
    [Required] string Cargo
);

// DTO para verificar senha do usuário logado
public record VerifyPasswordDto(
    [Required] string Password
);