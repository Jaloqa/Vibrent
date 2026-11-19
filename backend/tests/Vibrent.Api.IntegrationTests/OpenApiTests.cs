using System.Net;
using Shouldly;

namespace Vibrent.Api.IntegrationTests;

[Collection(ApiFixtureDefinition.Name)]
public sealed class OpenApiTests(ApiFactory factory)
{
    [Theory]
    [InlineData("/openapi/v1.json")]
    [InlineData("/swagger/index.html")]
    public async Task Should_BeReachableWithoutToken_When_RunningInDevelopment(string path)
    {
        using var client = factory.CreateClient();

        using var response = await client.GetAsync(new Uri(path, UriKind.Relative));

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
    }
}
