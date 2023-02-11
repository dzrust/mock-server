import { FC, Fragment, useMemo } from "react";
import { Button, Table } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { PartialCollection } from "../../models/collection";
import { createError } from "../../models/notification";
import { PostmanRoute, transformCollectionToRoutes } from "../../models/postman-route";
import { useGetCollectionQuery } from "../../services/postman";
import { usePostPostmanRoutesMutation } from "../../services/routes";
import { addNotification } from "../../slice/app-slice";
import { isLoading as getIsLoading } from "../../slice/app-slice";

type Props = {
  partialCollection: PartialCollection;
};

const SelectedCollectionView: FC<Props> = ({ partialCollection }) => {
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
        dispatch(addNotification(createError("Failed to sync postman data")));
      });
  };

  return (
    <Fragment>
      <h2>{partialCollection.name}</h2>
      <Button onClick={syncLocally} disabled={getDataIsLoading || isLoading}>
        Sync
      </Button>
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
    </Fragment>
  );
};

export default SelectedCollectionView;
