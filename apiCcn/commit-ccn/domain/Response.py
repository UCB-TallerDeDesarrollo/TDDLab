from typing import List


class Metric:
    cyclomatic_complexity: int
    file: str
    function_name: str
    nloc: int
    token_count: int

    def __init__(self, cyclomatic_complexity: int, file: str, function_name: str, nloc: int, token_count: int) -> None:
        self.cyclomatic_complexity = cyclomatic_complexity
        self.file = file
        self.function_name = function_name
        self.nloc = nloc
        self.token_count = token_count


class Main:
    metrics: List[Metric]

    def __init__(self, metrics: List[Metric]) -> None:
        self.metrics = metrics
