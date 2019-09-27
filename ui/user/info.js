import React from "react";
import { Card, CardTitle } from 'reactstrap';
import styled from 'styled-components';

const CommentsCard = styled(Card)`
    height: 100%;
`;

export const Info = () => (
    <CommentsCard body>
        <CardTitle><h1>Info</h1></CardTitle>
        <div>
        Friend codes:
        <ul><li>1234-1234-1234</li></ul>
        Games:
        <ul><li>IGN: Al TSV: 1686</li></ul>

        </div>
        <div>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam semper sit amet ligula vel vehicula. Sed nec quam nunc. Suspendisse porta risus in ante fringilla blandit. Ut est eros, consectetur sed enim nec, pretium pretium tellus. Cras quis leo non nunc tempor mollis. Aliquam euismod ullamcorper mauris, eget suscipit est consectetur eu. Nullam fringilla magna quis laoreet pretium. Sed nec ultricies ante, at consectetur libero. Mauris efficitur volutpat nulla bibendum feugiat. Sed sed tincidunt risus. Donec accumsan a quam sit amet ultrices.
        </div>
    </CommentsCard>
);