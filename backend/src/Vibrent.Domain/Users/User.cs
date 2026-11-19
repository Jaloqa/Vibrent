namespace Vibrent.Domain.Users;

public sealed class User
{
    private User()
    {
    }

    public Guid Id { get; private set; }

    public string Email { get; private set; } = string.Empty;

    public string PasswordHash { get; private set; } = string.Empty;

    public string DisplayName { get; private set; } = string.Empty;

    public string? Bio { get; private set; }

    public string? AvatarUrl { get; private set; }

    public string? City { get; private set; }

    public UserRole Role { get; private set; }

    public bool IsBlocked { get; private set; }

    public DateTimeOffset CreatedAt { get; private set; }

    public static User Register(string email, string passwordHash, string displayName, DateTimeOffset now) => new()
    {
        Id = Guid.CreateVersion7(now),
        Email = NormalizeEmail(email),
        PasswordHash = passwordHash,
        DisplayName = displayName,
        Role = UserRole.User,
        CreatedAt = now,
    };

    public static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();

    public void UpdateProfile(string displayName, string? bio, string? city)
    {
        DisplayName = displayName;
        Bio = bio;
        City = city;
    }

    public void ChangeAvatar(string? avatarUrl) => AvatarUrl = avatarUrl;

    public void ChangePasswordHash(string passwordHash) => PasswordHash = passwordHash;

    public void Block() => IsBlocked = true;

    public void Unblock() => IsBlocked = false;
}
