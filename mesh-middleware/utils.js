/**
 * Filters the data response from getMeshIntegrations based on name, type, or categories.
 * 
 * @param {Object} data - The data response from getMeshIntegrations.
 * @param {string} [name] - The name to filter by.
 * @param {string} [type] - The type to filter by.
 * @param {string[]} [categories] - The categories to filter by.
 * @returns {string[]} - The list of ids of the filtered items.
 */
function filterMeshIntegrations(data, name, type, categories) {
    if (!data || !data.content || !Array.isArray(data.content.items)) {
        return [];
    }

    return data.content.items
        .filter(item => {
            const matchesName = name ? item.name === name : false;
            const matchesType = type ? item.type === type : false;
            const matchesCategories = categories ? categories.some(category => item.categories.includes(category)) : false;

            return matchesName || matchesType || matchesCategories;
        })
        .map(item => item.id);
}

module.exports = {
    filterMeshIntegrations
};