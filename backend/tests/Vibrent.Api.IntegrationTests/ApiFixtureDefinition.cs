namespace Vibrent.Api.IntegrationTests;

[CollectionDefinition(Name)]
public sealed class ApiFixtureDefinition : ICollectionFixture<ApiFactory>
{
    public const string Name = "Api";
}
