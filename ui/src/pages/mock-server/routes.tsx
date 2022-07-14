import React, { ChangeEvent, FC, Fragment, useEffect, useMemo, useState } from "react";
import { Button, Col, FormControl, Row } from "react-bootstrap";
import { Response } from "../../models/response";
import { Route } from "../../models/route";
import { useCreateRouteMutation, useGetRoutesQuery } from "../../services/routes";
import SelectedRouteView from "./selected-route-view";
import UpdateResponseModal from "./update-response";
import { v4 } from "uuid";
import * as R from "ramda";
import { FixedSizeList as List } from "react-window";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle, faSyncAlt } from "@fortawesome/pro-solid-svg-icons";
import { useAppDispatch } from "../../hooks";
import { setError } from "../../slice/app-slice";

import "../../styles/route.css";

const escapeRegExp = (text: string) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

const RoutesPage: FC = () => {
  const dispatch = useAppDispatch();
  const [route, setRoute] = useState<Route | undefined>(() => undefined);
  const [response, setResponse] = useState<Response | undefined>(() => undefined);
  const [searchText, setSearchText] = useState(() => "");
  const [create] = useCreateRouteMutation();
  const { data, refetch, isError } = useGetRoutesQuery();
  const routes = useMemo(() => {
    if (!data) return [];
    R.sortWith<any>([R.descend<any>(R.prop("name"))]);
    const regex = new RegExp(escapeRegExp(searchText) ?? "", "gi");
    return R.filter(
      (route) => regex.test(route.url ?? "") || regex.test(route.defaultUrl) || regex.test(route.name),
      data,
    );
  }, [data, searchText]);
  const createRoute = () => {
    const url = `${v4()}/${v4()}`;
    create({
      name: "New Route",
      defaultUrl: url,
      url,
      method: "GET",
    })
      .then(refetch)
      .catch(() => {
        refetch();
        dispatch(setError("Failed to create new route"));
      });
  };
  useEffect(() => {
    if (route) {
      setRoute(data?.find((data) => data.id === route.id));
    }
  }, [data]);
  useEffect(() => {
    if (isError) {
      dispatch(setError("Failed to get routes"));
    } else {
      dispatch(setError(undefined));
    }
  }, [isError]);
  return (
    <Fragment>
      <Row>
        <Col md={3} className="route-container">
          <Row className="mt-3">
            <Col>
              <FormControl
                placeholder="Search Text"
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
              />
            </Col>
            <Col>
              <Button onClick={createRoute} variant="primary">
                <FontAwesomeIcon icon={faPlusCircle} />
              </Button>
              <Button onClick={refetch} className="mx-3" variant="secondary">
                <FontAwesomeIcon icon={faSyncAlt} />
              </Button>
            </Col>
          </Row>
          <Row className="mt-3">
            <List
              height={window.innerHeight - (64 + 38 + 32)}
              itemCount={routes.length}
              itemSize={55}
              width="100%"
              itemKey={(index) => routes[index].id}
            >
              {({ index, style }) => (
                <div key={routes[index].id} onClick={() => setRoute(routes[index])} style={style} className="route">
                  <div className="d-flex">
                    <div className="route__method">[{routes[index].method}]&nbsp;</div>
                    <div className="route__name" title={routes[index].name}>
                      {routes[index].name}
                    </div>
                  </div>
                  <div
                    className="route__url"
                    title={
                      !!routes[index].url && routes[index].url!.length > 0
                        ? routes[index].url
                        : routes[index].defaultUrl
                    }
                  >
                    {!!routes[index].url && routes[index].url!.length > 0
                      ? routes[index].url
                      : routes[index].defaultUrl}
                  </div>
                </div>
              )}
            </List>
          </Row>
        </Col>
        <Col
          md={9}
          className="mt-3"
          style={{ maxHeight: window.innerHeight - 64, height: window.innerHeight - 64, overflowY: "scroll" }}
        >
          {route ? (
            <SelectedRouteView route={route} setResponse={(response?: Response) => setResponse(response)} />
          ) : null}
        </Col>
      </Row>
      {response ? <UpdateResponseModal response={response} close={() => setResponse(undefined)} /> : null}
    </Fragment>
  );
};

export default RoutesPage;
