from typing import List, Optional
from ..domain.CommitMetrics import CommitMetrics
#las metricas obtenidas se guardaran en memoria
class InMemoryUserCommitMetricsRepository:
    def __init__(self):
        self.commitMetrics: List['CommitMetrics'] = []

    def get_ccn_by_commit(self) -> List['CommitMetrics']:
        return self.commitMetrics

