import React, { FC, useEffect, useState } from "react";
import { Button, Container, Table } from "react-bootstrap";
import ConfirmationModal from "../../components/confirmation-modal";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { PartialCollection } from "../../models/collection";
import { useGetCollectionsQuery } from "../../services/postman";
import { usePostSyncDatabaseMutation } from "../../services/routes";
import { setError, isLoading as getIsLoading } from "../../slice/app-slice";
import CollectionModal from "./collection-modal";

const SyncPage: FC = () => {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(getIsLoading);
  const { data: collections, isError } = useGetCollectionsQuery();
  const [isConfirming, setIsConfirming] = useState(() => false);
  const [selectedCollection, setSelectedCollection] = useState<PartialCollection | undefined>(() => undefined);
  const [postSyncDatabase] = usePostSyncDatabaseMutation();
  const syncDatabase = () => {
    if (isLoading) return;
    postSyncDatabase()
      .then(() => setIsConfirming(false))
      .catch(() => dispatch(setError("Failed to sync postman data")));
  };
  useEffect(() => {
    if (isError) {
      dispatch(setError("Failed to get postman collections"));
    } else {
      dispatch(setError(undefined));
    }
  }, [isError]);
  return (
    <Container>
      <h1>Sync Postman Data</h1>
      <Button onClick={() => setIsConfirming(true)} variant="warning">
        Sync Database
      </Button>
      <Table hover>
        <thead>
          <tr>
            <td>Name</td>
            <td>Open</td>
          </tr>
        </thead>
        <tbody>
          {(collections?.collections ?? []).map((collection) => (
            <tr key={collection.id}>
              <td>{collection.name}</td>
              <td>
                <Button onClick={() => setSelectedCollection(collection)}>Open</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      {selectedCollection ? (
        <CollectionModal close={() => setSelectedCollection(undefined)} partialCollection={selectedCollection} />
      ) : null}
      {isConfirming ? (
        <ConfirmationModal
          close={() => setIsConfirming(false)}
          onNo={() => setIsConfirming(false)}
          onYes={syncDatabase}
          disabled={isLoading}
          confirmationText="If you perform this action it will clear out all of the data from the database"
        />
      ) : null}
    </Container>
  );
};

export default SyncPage;
