import React, { FC, useMemo } from "react";
import { Button, Container, Modal, Table } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { PartialCollection } from "../../models/collection";
import { PostmanRoute, transformCollectionToRoutes } from "../../models/postman-route";
import { useGetCollectionQuery } from "../../services/postman";
import { usePostPostmanRoutesMutation } from "../../services/routes";
import { setError } from "../../slice/app-slice";
import { isLoading as getIsLoading } from "../../slice/app-slice";

type Props = {
  partialCollection: PartialCollection;
  close: () => void;
};

const CollectionModal: FC<Props> = ({ partialCollection, close }) => {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(getIsLoading);
  const { data: collectionData, isLoading: getDataIsLoading } = useGetCollectionQuery(partialCollection.uid);
  const [syncData] = usePostPostmanRoutesMutation();
  const requests = useMemo(() => {
    const postmanRequests: PostmanRoute[] = [];
    if (collectionData) {
      postmanRequests.push(...transformCollectionToRoutes(collectionData.collection.item));
    }
    return postmanRequests;
  }, [collectionData]);

  const syncLocally = () => {
    if (isLoading) return;
    syncData(requests)
      .then((results) => {
        console.log(results);
      })
      .catch(() => {
        dispatch(setError("Failed to sync postman data"));
      });
  };

  return (
    <Modal show onHide={close} size="lg">
      <Modal.Header>
        <h2>{partialCollection.name}</h2>
        <Button onClick={syncLocally} disabled={getDataIsLoading || isLoading}>
          Sync
        </Button>
      </Modal.Header>
      <Modal.Body>
        {getDataIsLoading || isLoading ? <p>Loading Data!!!!!</p> : null}
        <Container style={{ maxHeight: "52rem", maxWidth: "100%", overflow: "auto" }}>
          <Table>
            <thead>
              <tr>
                <td>Name</td>
                <td>Url</td>
                <td>Method</td>
                <td>Number of Responses</td>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={`${request.method} - ${request.defaultUrl}`}>
                  <td>{request.name}</td>
                  <td>
                    <p>{request.defaultUrl}</p>
                  </td>
                  <td>{request.method}</td>
                  <td>{request.responses.length}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Container>
      </Modal.Body>
    </Modal>
  );
};

export default CollectionModal;
