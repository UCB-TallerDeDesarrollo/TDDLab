from typing import List

class CommitMetrics:
    cyclomatic_complexity: int
    file: str
    function_name: str
    nloc: int
    token_count: int
    # constructor de la clase
    def __init__(self, cyclomatic_complexity: int, file: str, function_name: str, nloc: int, token_count: int) -> None:
        self.cyclomatic_complexity = cyclomatic_complexity
        self.file = file
        self.function_name = function_name
        self.nloc = nloc
        self.token_count = token_count