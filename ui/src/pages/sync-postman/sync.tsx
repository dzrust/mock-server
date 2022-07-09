import React, { FC, useEffect, useState } from "react";
import { Button, Container, Table } from "react-bootstrap";
import { useAppDispatch } from "../../hooks";
import { PartialCollection } from "../../models/collection";
import { useGetCollectionsQuery } from "../../services/postman";
import { setError } from "../../slice/app-slice";
import CollectionModal from "./collection-modal";

const SyncPage: FC = () => {
  const dispatch = useAppDispatch();
  const { data: collections, isError } = useGetCollectionsQuery();
  const [selectedCollection, setSelectedCollection] = useState<PartialCollection | undefined>(() => undefined);
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
    </Container>
  );
};

export default SyncPage;
