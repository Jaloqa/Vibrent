using System.Buffers.Text;
using System.Globalization;
using System.Text;

namespace Vibrent.Api.Features.Feed.GetFeed;

internal readonly record struct FeedCursor(DateTimeOffset StartsAt, Guid Id)
{
    public string Encode() =>
        Base64Url.EncodeToString(Encoding.UTF8.GetBytes(
            string.Create(CultureInfo.InvariantCulture, $"{StartsAt.UtcTicks}_{Id:N}")));

    public static bool TryDecode(string value, out FeedCursor cursor)
    {
        cursor = default;

        string decoded;
        try
        {
            decoded = Encoding.UTF8.GetString(Base64Url.DecodeFromChars(value));
        }
        catch (FormatException)
        {
            return false;
        }

        var parts = decoded.Split('_');
        if (parts.Length != 2
            || !long.TryParse(parts[0], NumberStyles.None, CultureInfo.InvariantCulture, out var ticks)
            || ticks < DateTimeOffset.MinValue.UtcTicks
            || ticks > DateTimeOffset.MaxValue.UtcTicks
            || !Guid.TryParseExact(parts[1], "N", out var id))
        {
            return false;
        }

        cursor = new FeedCursor(new DateTimeOffset(ticks, TimeSpan.Zero), id);
        return true;
    }
}
