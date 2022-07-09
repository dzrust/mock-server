import React, { ChangeEvent, FC, useEffect, useMemo, useState } from "react";
import { Button, Col, Container, FloatingLabel, FormControl, Row, Table } from "react-bootstrap";
import { Response } from "../../models/response";
import { Route } from "../../models/route";
import { useCreateRouteMutation, useGetRoutesQuery } from "../../services/routes";
import RouteModal from "./route-modal";
import UpdateResponseModal from "./update-response";
import { v4 } from "uuid";
import * as R from "ramda";
import { FixedSizeList as List } from "react-window";

import "../../styles/table.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/pro-solid-svg-icons";
import { useAppDispatch } from "../../hooks";
import { setError } from "../../slice/app-slice";

const escapeRegExp = (text: string) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

const RoutesPage: FC = () => {
  const dispatch = useAppDispatch();
  const [route, setRoute] = useState<Route | undefined>(() => undefined);
  const [response, setResponse] = useState<Response | undefined>(() => undefined);
  const [searchText, setSearchText] = useState(() => "");
  const [sortProp, setSortProp] = useState<keyof Route | undefined>(() => undefined);
  const [isDescending, setIsDescending] = useState(() => false);
  const [create] = useCreateRouteMutation();
  const { data, refetch, isError } = useGetRoutesQuery();
  const onTableHeaderClick = (newSortProp: keyof Route) => {
    if (sortProp !== newSortProp) {
      setSortProp(newSortProp);
    } else if (sortProp === newSortProp && !isDescending) {
      setIsDescending(true);
    } else {
      setSortProp(undefined);
      setIsDescending(false);
    }
  };
  const getASCDSCHeader = (newSortProp: keyof Route) => {
    return sortProp !== newSortProp ? null : isDescending ? (
      <FontAwesomeIcon icon={faChevronDown} />
    ) : (
      <FontAwesomeIcon icon={faChevronUp} />
    );
  };
  const routes = useMemo(() => {
    if (!data) return [];
    R.sortWith<any>([R.descend<any>(R.prop("name"))]);
    const regex = new RegExp(escapeRegExp(searchText) ?? "", "gi");
    const sort = sortProp
      ? R.sortWith<Route>([
          isDescending
            ? R.descend<Route>(R.propOr("", sortProp as any))
            : R.ascend<Route>(R.propOr("", sortProp as any)),
        ])
      : (routes: Route[]) => routes;
    return sort(
      R.filter((route) => regex.test(route.url ?? "") || regex.test(route.defaultUrl) || regex.test(route.name), data),
    );
  }, [data, sortProp, isDescending, searchText]);
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
    <Container>
      <h1>Routes</h1>
      <Row>
        <Col>
          <FloatingLabel controlId="floatingInput" label="Search Text" className="mb-3">
            <FormControl
              placeholder="name@example.com"
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
            />
          </FloatingLabel>
        </Col>
        <Col>
          <Button onClick={createRoute} variant="primary">
            Add Route
          </Button>
        </Col>
      </Row>
      <hr />
      <div className="table">
        <Row className="virtual-header">
          <Col sm={2} onClick={() => onTableHeaderClick("name")} className="virtual-header-column">
            Name {getASCDSCHeader("name")}
          </Col>
          <Col sm={4} onClick={() => onTableHeaderClick("defaultUrl")} className="virtual-header-column">
            Url {getASCDSCHeader("defaultUrl")}
          </Col>
          <Col sm={4} onClick={() => onTableHeaderClick("url")} className="virtual-header-column">
            Url Override {getASCDSCHeader("url")}
          </Col>
          <Col sm={2} onClick={() => onTableHeaderClick("method")} className="virtual-header-column">
            Method {getASCDSCHeader("method")}
          </Col>
        </Row>
        <List
          height={window.innerHeight - 250}
          itemCount={routes.length}
          itemSize={150}
          width="100%"
          itemKey={(index) => routes[index].id}
        >
          {({ index, style }) => (
            <Row key={routes[index].id} onClick={() => setRoute(routes[index])} style={style} className="virtual-row">
              <Col sm={2} className="virtual-column">
                {routes[index].name}
              </Col>
              <Col sm={4} className="virtual-column">
                {routes[index].defaultUrl}
              </Col>
              <Col sm={4} className="virtual-column">
                {routes[index].url}
              </Col>
              <Col sm={2} className="virtual-column">
                {routes[index].method}
              </Col>
            </Row>
          )}
        </List>
      </div>
      {route ? (
        <RouteModal
          route={route}
          close={() => setRoute(undefined)}
          setResponse={(response?: Response) => setResponse(response)}
        />
      ) : null}
      {response ? <UpdateResponseModal response={response} close={() => setResponse(undefined)} /> : null}
    </Container>
  );
};

export default RoutesPage;
