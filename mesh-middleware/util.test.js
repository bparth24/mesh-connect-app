const { filterMeshIntegrations } = require('./utils');

const mockMeshIntegrationsData = {
    content: {
        items: [
            {
                id: "9226e5c2-ebc3-4fdd-94f6-ed52cdce1420",
                name: "Binance",
                type: "binanceInternationalDirect",
                categories: ["exchange"]
            },
            {
                id: "47624467-e52e-4938-a41a-7926b6c27acf",
                name: "Coinbase",
                type: "coinbase",
                categories: ["exchange"]
            }
        ]
    }
};

test('filters by name', () => {
    const result = filterMeshIntegrations(mockMeshIntegrationsData, 'Binance');
    expect(result).toEqual(["9226e5c2-ebc3-4fdd-94f6-ed52cdce1420"]);
});

test('filters by type', () => {
    const result = filterMeshIntegrations(mockMeshIntegrationsData, null, 'coinbase');
    expect(result).toEqual(["47624467-e52e-4938-a41a-7926b6c27acf"]);
});

test('filters by categories', () => {
    const result = filterMeshIntegrations(mockMeshIntegrationsData, null, null, ['exchange']);
    expect(result).toEqual(["9226e5c2-ebc3-4fdd-94f6-ed52cdce1420", "47624467-e52e-4938-a41a-7926b6c27acf"]);
});

test('returns empty array for no matches', () => {
    const result = filterMeshIntegrations(mockMeshIntegrationsData, 'NonExistentName');
    expect(result).toEqual([]);
});

test('handles invalid data structure', () => {
    const result = filterMeshIntegrations(null);
    expect(result).toEqual([]);
});