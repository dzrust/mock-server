import React, { FC, useState } from "react";
import { Button, Container, Table } from "react-bootstrap";
import { PartialCollection } from "../../models/collection";
import { useGetCollectionsQuery } from "../../services/postman";
import CollectionModal from "./collection-modal";

const SyncPage: FC = () => {
  const { data: collections } = useGetCollectionsQuery();
  const [selectedCollection, setSelectedCollection] = useState<PartialCollection | undefined>(() => undefined);
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
