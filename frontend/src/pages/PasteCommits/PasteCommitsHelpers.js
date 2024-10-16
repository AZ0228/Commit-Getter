function validateGithubCommitLinks(input) {
    //regular expression to match a valid GitHub commit URL
    const commitLinkRegex = /^https:\/\/github\.com\/[\w\-]+\/[\w\-]+\/commit\/[a-f0-9]{40}$/;

    const links = input.split('\n');

    const validLinks = [];
    const nonValidLinks = [];

    //iterate through the links, validate, and categorize them
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

    //return both valid and non-valid links
    return {
        validLinks,
        nonValidLinks
    };
}

export { validateGithubCommitLinks };