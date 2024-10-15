class CommitRepository:
    url: str
    def __init__(self, url:str) -> None:
        self.url = url