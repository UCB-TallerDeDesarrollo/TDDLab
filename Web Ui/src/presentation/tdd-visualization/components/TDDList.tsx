import type {
  CommitDataObject,
} from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";

import TDDCycleList from "./TDDCycleList";

// =====================================================
// PROPIEDADES
// =====================================================

interface TDDListProps {
  commits: CommitDataObject[];
}

// =====================================================
// COMPONENTE
// =====================================================

function TDDList({
  commits,
}: Readonly<TDDListProps>) {

  return (
    <div
      style={{
        marginTop: "30px",
        width: "100%",
      }}
      data-testid="tdd-commit-list"
    >

      {commits.length === 0 ? (

        <div
          className="error-message"
          data-testid="errorMessage"
        >
          No se encontraron commits para
          la rama seleccionada.
        </div>

      ) : (

        <div
          style={{
            width: "100%",
          }}
        >
          <TDDCycleList
            commitsInfo={commits}
          />
        </div>

      )}

    </div>
  );
}

export default TDDList;
