# repo_utils.py

from urllib.parse import urlparse

def parse_repo_url(repo_url):
    """
    Parse the GitHub repo URL to extract the base repo URL and the ref (branch or commit).
    Returns a tuple (base_repo_url, ref).
    """
    parsed_url = urlparse(repo_url)
    path_parts = parsed_url.path.strip('/').split('/')
 
    if len(path_parts) < 2:
        raise ValueError("URL del repositorio inválida.")
 
    username = path_parts[0]
    repo = path_parts[1]

    if repo.endswith('.git'):
        repo = repo[:-4]


    base_repo_url = f"https://github.com/{username}/{repo}"
 
    ref = None
    if len(path_parts) > 3 and (path_parts[2] == 'commit' or path_parts[2] == 'tree'):
        ref = path_parts[3]
 
    return base_repo_url, ref
