function validateGithubCommitLinks(input) {
    // Regular expression to match a valid GitHub commit URL
    const commitLinkRegex = /^https:\/\/github\.com\/[\w\-]+\/[\w\-]+\/commit\/[a-f0-9]{40}$/;

    // Split the input by newlines
    const links = input.split('\n');

    // Create arrays for valid and non-valid links
    const validLinks = [];
    const nonValidLinks = [];

    // Iterate through the links, validate, and categorize them
    links.forEach(link => {
        const trimmedLink = link.trim();
        if (trimmedLink !== '') {
            if (commitLinkRegex.test(trimmedLink)) {
                validLinks.push(trimmedLink);
            } else {
                nonValidLinks.push(trimmedLink);
            }
        }
    });

    // Return both valid and non-valid links
    return {
        validLinks,
        nonValidLinks
    };
}

export { validateGithubCommitLinks };