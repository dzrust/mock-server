import { faPlug, faSyncAlt } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CSSProperties, FC, Fragment, useEffect, useMemo, useState } from "react";
import { Button, Col, Row, Table } from "react-bootstrap";
import ConfirmationModal from "../../components/confirmation-modal";
import { useAppDispatch, useAppSelector, useWindowHeightAndWidth } from "../../hooks";
import { PartialCollection } from "../../models/collection";
import { createError } from "../../models/notification";
import { useGetCollectionsQuery } from "../../services/postman";
import { usePostSyncDatabaseMutation } from "../../services/routes";
import { addNotification, isLoading as getIsLoading } from "../../slice/app-slice";
import SelectedCollectionView from "./selected-collection-view";

const SyncPage: FC = () => {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(getIsLoading);
  const { windowHeight } = useWindowHeightAndWidth();
  const { data: collections, isError, refetch } = useGetCollectionsQuery();
  const [isConfirming, setIsConfirming] = useState(() => false);
  const [selectedCollection, setSelectedCollection] = useState<PartialCollection | undefined>(() => undefined);
  const [postSyncDatabase] = usePostSyncDatabaseMutation();
  const syncDatabase = () => {
    if (isLoading) return;
    postSyncDatabase()
      .then(() => setIsConfirming(false))
      .catch(() => dispatch(addNotification(createError("Failed to sync postman data"))));
  };
  useEffect(() => {
    if (isError) {
      dispatch(addNotification(createError("Failed to get postman collections")));
    }
  }, [isError]);
  const leftWindowContainerStyle = useMemo(() => {
    const height = windowHeight - 143;
    return { maxHeight: height, height, overflowY: "auto" } as CSSProperties;
  }, [windowHeight]);
  const rightWindowContainerStyle = useMemo(() => {
    const height = windowHeight - 75;
    return { maxHeight: height, height, overflowY: "auto" } as CSSProperties;
  }, [windowHeight]);
  return (
    <Fragment>
      <Row>
        <Col md={3} className="route-container">
          <Row className="mt-3">
            <Col>
              <Button onClick={() => setIsConfirming(true)} variant="warning" disabled={isLoading}>
                <span className="mx-2">Sync Database</span>
                <FontAwesomeIcon icon={faPlug} />
              </Button>
            </Col>
            <Col>
              <Button onClick={refetch} className="mx-3" variant="secondary" disabled={isLoading}>
                <FontAwesomeIcon icon={faSyncAlt} />
              </Button>
            </Col>
          </Row>
          <hr />
          <Row className="mt-3" style={leftWindowContainerStyle}>
            <Col>
              <Table hover>
                <tbody>
                  {(collections?.collections ?? []).map((collection) => (
                    <tr key={collection.id} onClick={() => setSelectedCollection(collection)} className="clickable">
                      <td>{collection.name}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Col>
          </Row>
        </Col>
        <Col md={9} className="mt-3" style={rightWindowContainerStyle}>
          {selectedCollection ? <SelectedCollectionView partialCollection={selectedCollection} /> : null}
        </Col>
      </Row>
      {isConfirming ? (
        <ConfirmationModal
          close={() => setIsConfirming(false)}
          onNo={() => setIsConfirming(false)}
          onYes={syncDatabase}
          disabled={isLoading}
          confirmationText="If you perform this action it will clear out all of the data from the database"
        />
      ) : null}
    </Fragment>
  );
};

export default SyncPage;
