using System.Net;
using Shouldly;

namespace Vibrent.Api.IntegrationTests;

[Collection(ApiFixtureDefinition.Name)]
public sealed class HealthCheckTests(ApiFactory factory)
{
    [Fact]
    public async Task Should_ReturnHealthy_When_DatabaseIsReachable()
    {
        using var client = factory.CreateClient();

        using var response = await client.GetAsync(new Uri("/health", UriKind.Relative));

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        (await response.Content.ReadAsStringAsync()).ShouldBe("Healthy");
    }
}
