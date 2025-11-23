def callback(commit, metadata):
    author_name = commit.author_name.decode('utf-8')
    author_email = commit.author_email.decode('utf-8')
    
    # Only keep commits from undefinedlab
    if author_name == "undefinedlab" or author_email == "thechakralabs@gmail.com":
        # Remove all parent references to commits from other authors
        new_parents = []
        for parent in commit.parents:
            try:
                parent_commit = metadata.repo[parent]
                parent_name = parent_commit.author_name.decode('utf-8')
                parent_email = parent_commit.author_email.decode('utf-8')
                # Only keep parent if it's also from undefinedlab
                if parent_name == "undefinedlab" or parent_email == "thechakralabs@gmail.com":
                    new_parents.append(parent)
            except:
                # If parent doesn't exist or can't be checked, skip it
                pass
        commit.parents = new_parents
    else:
        # Skip all other commits
        commit.skip()

