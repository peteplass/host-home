import * as React from "react";

import { makeStyles, Paper, createStyles, Grid, Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, ValueLabelProps, List, ListItem, ListItemAvatar, Avatar, ListItemText } from "@material-ui/core";
import { useHostHomeData } from "../data/data-context";
import { MatchResult, Guest, Host, GuestInterestLevel, HostQuestion, HostResponse, ResponseValue, Restriction, GuestResponse, GuestQuestion } from "../models";
import { useParams, useHistory, useLocation } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle, faPaw, faSmokingBan, faWineBottle, faPrescriptionBottleAlt, faSmoking, faBaby, faUsers, faBed, faHeart } from "@fortawesome/free-solid-svg-icons";

import { HostHomeType } from "../models/HostHomeType";
import { AdminGuestStyle } from "./style"
// import './AdminGuestView.css';

const useStyles = makeStyles(theme => (
    createStyles({
        root: {
            flexGrow: 1
        },
        toolbar: {
            borderBottom: `1px solid ${theme.palette.divider}`,
        },
        toolbarTitle: {
            flex: 1,
        },
        toolbarSecondary: {
            justifyContent: 'space-between',
            overflowX: 'auto',
        },
        toolbarLink: {
            padding: theme.spacing(1),
            flexShrink: 0,
        },
        mainFeaturedPost: {
            position: 'relative',
            backgroundColor: theme.palette.grey[800],
            color: theme.palette.common.white,
            marginBottom: theme.spacing(4),
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
        },
        overlay: {
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            backgroundColor: 'rgba(0,0,0,.3)',
        },
        mainFeaturedPostContent: {
            position: 'relative',
            padding: theme.spacing(3),
            [theme.breakpoints.up('md')]: {
                padding: theme.spacing(6),
                paddingRight: 0,
            },
        },
        mainGrid: {
            marginTop: theme.spacing(3),
        },
        card: {
            display: 'flex',
        },
        cardDetails: {
            flex: 1,
        },
        cardMedia: {
            width: 160,
        },
        markdown: {
            ...theme.typography.body2,
            padding: theme.spacing(3, 0),
        },
        sidebarAboutBox: {
            padding: theme.spacing(2),
            backgroundColor: theme.palette.grey[200],
        },
        sidebarSection: {
            marginTop: theme.spacing(3),
        },
        footer: {
            backgroundColor: theme.palette.background.paper,
            marginTop: theme.spacing(8),
            padding: theme.spacing(6, 0),
        },
        paper: {
            padding: theme.spacing(2),
            textAlign: 'center',
            color: theme.palette.text.secondary,
        },
        table: {
            minWidth: 650,
        },
        failedQuestion: {
            fontWeight: 'bolder',
            height: '100%',
            width: '100%'
        },
        passedQuestion: {
            backgroundColor: '#ecf0f1'
        },
        tableHeader: {
            backgroundColor: '#00AAEF',
            fontStyle: 'normal',
            fontWeight: 'bold',
            fontSize: '16px',
            lineHeight: '22px',
            color: '#FFFFFF'
        },
        tableHeaderCell: {
            fontStyle: 'normal',
            fontWeight: 'bold',
            fontSize: '16px',
            lineHeight: '22px',
            color: '#FFFFFF'
        },
        matchingHeaderCell: {
            fontStyle: 'normal',
            fontWeight: 'bold',
            fontSize: '16px',
            lineHeight: '22px',
            color: '#FFFFFF',
            textAlign: 'center'
        },
        tableRowOdd: {
            backgroundColor: '#FFFFFF'
        },
        tableRowEven: {
            backgroundColor: '#F5F5F5'
        }
    })));

interface InterestDescription {
    interested: GuestInterestLevel;
    lastUpdated: Date;
}

interface InterestMapping {
    [key: number]: InterestDescription;
}

export const AdminGuestView = () => {

    const classes = useStyles({});
    const { id } = useParams();
    const guestId = parseInt(id || '-1');

    const {
        data,
        dispatch,
        addGuest,
        guestsById,
        guestsResponsesByGuestId,
        guestQuestionsById,
        guestQuestionsByKey
    } = useHostHomeData();

    const petsKeys = ['pets_have', 'host_pets'];

    const havePetsQuestion = guestQuestionsByKey.get('pets_have') as GuestQuestion;
    const hostPetsQuestion = guestQuestionsByKey.get('host_pets') as GuestQuestion;

    const history = useHistory();

    const guest: Guest = data.guests.find((g: Guest) => g.id === guestId) || {} as Guest;

    const matched = React.useMemo(() => {
        return data.hosts.filter((host: Host) => {
            return data.matchResults.filter((matchResult: MatchResult) => (
                matchResult.guestId === guestId
                && matchResult.hostId === host.id
                && matchResult.restrictionsFailed.length < 1
                && matchResult.guestInterestLevel !== GuestInterestLevel.NotInterested
            )).length > 0;
        });
    }, [data.hosts, data.matchResults]);

    const unmatched = React.useMemo(() => {
        return data.hosts.filter((host: Host) => {
            return data.matchResults.filter((matchResult: MatchResult) => (
                matchResult.guestId === guestId
                && matchResult.hostId === host.id
                && matchResult.restrictionsFailed.length > 0
            )).length > 0;
        });
    }, [data.hosts, data.matchResults]);

    const rejected = React.useMemo(() => {

        return data.hosts.filter((host: Host) => {
            return data.matchResults.filter((matchResult: MatchResult) => (
                matchResult.guestId === guestId
                && matchResult.hostId === host.id
                && matchResult.restrictionsFailed.length < 1
                && matchResult.guestInterestLevel === GuestInterestLevel.NotInterested
            )).length > 0;
        });
    }, [data.hosts, data.matchResults]);

    // const unmatched = React.useMemo(() => {
    //     return data.hosts.filter((host: Host) => matched.filter((matchedHost: Host) => host.id === matchedHost.id).length < 1)
    // }, [data.matchResults]);

    // const unmatched = React.useMemo(() => {
    //     return data.hosts.filter((host: Host) => matched.filter((matchedHost: Host) => host.id === matchedHost.id).length < 1)
    // }, [data.matchResults]);

    const hostQuestionsFailed = data.matchResults
        .filter((matchResult: MatchResult) => (
            matchResult.guestId === guestId
            && (matchResult.restrictionsFailed.length > 0 || matchResult.guestInterestLevel === GuestInterestLevel.NotInterested)
        ))
        .reduce<Map<number, Array<number>>>((prev: Map<number, Array<number>>, cur: MatchResult) => {

            // console.log(`hostQuestionsFailed: adding cur: ${JSON.stringify(cur)}`);
            // console.log(` ... to prev: ${JSON.stringify(prev)}`);

            prev.set(cur.hostId, cur.restrictionsFailed.map((r: Restriction) => r.hostQuestionId));

            return prev;

        }, new Map<number, Array<number>>());




    console.log(`hostQuestionsFailed: ${JSON.stringify(hostQuestionsFailed)}`);

    const interestByHostId: InterestMapping = React.useMemo(() => {
        return data.matchResults
            .filter((matchResult: MatchResult) => matchResult.guestId === guestId)
            .reduce<InterestMapping>((map: InterestMapping, matchResult: MatchResult, index: number) => {
                map[matchResult.hostId] = {
                    interested: matchResult.guestInterestLevel,
                    lastUpdated: matchResult.lastInterestUpdate
                };
                return map;
            }, {} as InterestMapping);
    }, [data.matchResults]);

    const location = useLocation();

    React.useEffect(() => {
        try {
            window.scroll({
                top: 0,
                left: 0,
                behavior: 'auto',
            });
        } catch (error) {
            window.scrollTo(0, 0);
        }
    }, [location.pathname, location.search]);

    const guestResponsesByKey = data.guestResponses
        .filter((r: GuestResponse) => {
            return r.guestId === guest.id;
        })
        .reduce<Map<string, string>>((prev: Map<string, string>, cur: GuestResponse) => {
            prev.set(
                (data.guestQuestions.find((q: GuestQuestion) => q.id === cur.questionId) as GuestQuestion).questionKey,
                (data.responseValues.find((rv: ResponseValue) => rv.id == cur.responseValues[0]) as ResponseValue).text
            )
            return prev;
        }, new Map<string, string>());

    const questionsByKey = data.guestQuestions
        .reduce<Map<string, GuestQuestion>>((prev: Map<string, GuestQuestion>, cur: GuestQuestion) => {
            prev.set(cur.questionKey, cur);
            return prev;
        }, new Map<string, GuestQuestion>());



    const parentingResponse = guestResponsesByKey.get('parenting_guest') as string;
    const parenting = parentingResponse.toUpperCase() === 'YES';


    const relationshipResponse = guestResponsesByKey.get('guests_relationship') as string;
    const relationship = relationshipResponse.toUpperCase() === 'YES';



    const hostTypeDisplay = (t: HostHomeType) => {
        switch (t) {

            case HostHomeType.Full:
                return 'Full Only';

            case HostHomeType.Both:
                return 'Respite/Full';

            case HostHomeType.Respite:
                return 'Respite Only';

            default:
                throw new Error(`Unhandled host home type: ${JSON.stringify(t)}`);

        }
    }

    const FailCell = (props: { value: string }) => <div>
        <div style={{ padding: '0px 5px', textAlign: 'center' }}>
            <FontAwesomeIcon
                icon={faTimesCircle}
                style={{ 'color': 'red' }}
            />

        </div>
        <div style={{ padding: '0px 3px', textAlign: 'center' }}>{props.value}</div>
    </div>;

    const SuccessCell = (props: { value: string }) => <div style={{ padding: '0px 3px', textAlign: 'center' }}>
        {props.value}
    </div>

    const MatchTable = (props: { tableName: string, hostList: Array<Host>, displayInterested: boolean, allowClick: boolean }) => {
        return (
            <Grid item xs={12}>
                <Paper className={classes.paper}>
                    <Typography component='h2' align='left'>{props.tableName}</Typography>
                    <Table className={classes.table} aria-label={`${props.tableName.toLowerCase()} table`}>
                        <TableHead>
                            <TableRow className={classes.tableHeader}>
                                <TableCell className={classes.tableHeaderCell}>Name</TableCell>
                                <TableCell className={classes.tableHeaderCell}>Address</TableCell>
                                {
                                    data.hostQuestions.map((q: HostQuestion, index: number) => {
                                        return (
                                            <TableCell className={classes.matchingHeaderCell} key={index}>{q.displayName}</TableCell>
                                        );
                                    })
                                }
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                props.hostList.map(
                                    (host: Host, index: number) => <><TableRow key={index} className={index % 2 === 0 ? classes.tableRowEven : classes.tableRowOdd}>
                                        <TableCell onClick={
                                            props.allowClick
                                                ? () => {
                                                    console.log(`AdminGuestView:MatchTable: guestId = ${guestId}`);
                                                    console.log(`AdminGuestView:MatchTable: host.id = ${host.id}`);
                                                    history.push(`/hosthome/guests/${guestId}/matches/${host.id}`)
                                                }
                                                : () => { }
                                        }>
                                            <AdminGuestStyle.HostMatchClick>
                                                {host.name}
                                            </AdminGuestStyle.HostMatchClick>
                                        </TableCell>
                                        <TableCell>{host.address}</TableCell>
                                        {
                                            data.hostQuestions.map((q: HostQuestion, index: number) => {
                                                return (
                                                    <TableCell key={index}>
                                                        {
                                                            (() => {

                                                                if (q.questionKey === 'duration_of_stay') {

                                                                    if (!hostQuestionsFailed.has(host.id)) {
                                                                        return <SuccessCell value={hostTypeDisplay(host.type)} />;
                                                                    }

                                                                    const failedQuestionsForHost = hostQuestionsFailed.get(host.id) as Array<number>;
                                                                    const isFailed = failedQuestionsForHost.indexOf(q.id) >= 0;

                                                                    return isFailed
                                                                        ? <FailCell value={hostTypeDisplay(host.type)} />
                                                                        : <SuccessCell value={hostTypeDisplay(host.type)} />;

                                                                }

                                                                if (q.questionKey === 'hosting_amount') {

                                                                    if (!hostQuestionsFailed.has(host.id)) {
                                                                        return <SuccessCell value={host.hostingAmount.toString()} />;
                                                                    }

                                                                    const failedQuestionsForHost = hostQuestionsFailed.get(host.id) as Array<number>;
                                                                    const isFailed = failedQuestionsForHost.indexOf(q.id) >= 0;

                                                                    return isFailed
                                                                        ? <FailCell value={host.hostingAmount.toString()} />
                                                                        : <SuccessCell value={host.hostingAmount.toString()} />;

                                                                }


                                                                const response = data.hostResponses
                                                                    .find((hr: HostResponse) => hr.hostId == host.id && hr.questionId == q.id);

                                                                if (!response) {
                                                                    return 'Not answered';
                                                                }
                                                                return response
                                                                    .responseValues
                                                                    .map((rvId: number, index: number) => {

                                                                        const rv = data.responseValues
                                                                            .find((rv: ResponseValue) => rv.id === rvId);
                                                                        if (!rv) {
                                                                            throw new Error(`Unknown response value ID: ${rvId}`);
                                                                        }


                                                                        if (!hostQuestionsFailed.has(host.id)) {
                                                                            return <SuccessCell value={rv.text} />;
                                                                        }


                                                                        const failedQuestionsForHost = hostQuestionsFailed.get(host.id) as Array<number>;


                                                                        const isFailed = failedQuestionsForHost.indexOf(q.id) >= 0;


                                                                        return isFailed
                                                                            ? <FailCell key={index} value={rv.text} />
                                                                            : <SuccessCell key={index} value={rv.text} />;

                                                                    })
                                                            })()
                                                        }
                                                    </TableCell>
                                                );
                                            })
                                        }
                                    </TableRow>
                                        {
                                            props.displayInterested && interestByHostId[host.id].interested === GuestInterestLevel.Interested
                                                ? <TableRow key={index}>
                                                    <TableCell
                                                        colSpan={data.hostQuestions.length + 2}
                                                        style={{
                                                            backgroundColor: '#80e27e'
                                                        }}
                                                    >
                                                        {`Guest indicated interest at ${interestByHostId[host.id].lastUpdated.toLocaleString()}`}
                                                    </TableCell>
                                                </TableRow>
                                                : null
                                        }
                                    </>
                                )
                            }
                        </TableBody>
                    </Table>
                </Paper>
            </Grid>
        );
    }



    return (
        <React.Fragment>
            <Grid container spacing={3}>

                {/* Page Title */}
                <Grid item xs={12}>
                    <Paper className={classes.paper}>
                        <Typography
                            component='h1'
                            align='center'
                            style={{ fontSize: '2em' }}
                        >
                            Guest Matches
                            </Typography>
                    </Paper>
                </Grid>

                {/* Profile Photo */}
                <Grid item xs={4}>
                    <Paper className={classes.paper}>
                        <img
                            src={guest.imageUrl}
                            width={'400em'}
                            alt='Profile Photo'
                        />
                    </Paper>
                </Grid>

                {/* List of Preferences/Proclivities */}
                <Grid item xs={8}>
                    <Paper className={classes.paper}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Typography
                                    align='left'
                                    component='h1'
                                    style={{ fontSize: '1.4em' }}
                                >
                                    {`${guest.name}, ${((new Date()).getFullYear() - guest.dateOfBirth.getFullYear())}`}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <List>
                                    <ListItem>
                                        <ListItemAvatar>
                                            <Avatar>
                                                <FontAwesomeIcon icon={faUsers} size="sm" />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText primary={`I would like accommodations for ${guest.numberOfGuests} guests`} />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemAvatar>
                                            <Avatar>
                                                <FontAwesomeIcon icon={faBed} size="sm" />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText primary={`${hostTypeDisplay(guest.type)}`} />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemAvatar>
                                            <Avatar>
                                                <FontAwesomeIcon icon={faSmoking} size="sm" />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText primary={guest.smokingText} />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemAvatar>
                                            <Avatar>
                                                <FontAwesomeIcon icon={faWineBottle} />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText primary={guest.drinkingText} />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemAvatar>
                                            <Avatar>
                                                <FontAwesomeIcon icon={faPrescriptionBottleAlt} />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText primary={guest.substancesText} />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemAvatar>
                                            <Avatar>
                                                <FontAwesomeIcon icon={faPaw} />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText primary={guest.petsText} />
                                    </ListItem>
                                    {
                                        relationship
                                            ? <ListItem>
                                                <ListItemAvatar>
                                                    <Avatar>
                                                        <FontAwesomeIcon icon={faHeart} />
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText primary='I am in a relationship' />
                                            </ListItem>
                                            : null
                                    }
                                    {
                                        parenting
                                            ? <ListItem>
                                                <ListItemAvatar>
                                                    <Avatar>
                                                        <FontAwesomeIcon icon={faBaby} />
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText primary='I am parenting' />
                                            </ListItem>
                                            : null
                                    }

                                </List>
                            </Grid>
                        </Grid>
                    </Paper>

                </Grid>

                {/*  */}
                <MatchTable tableName='Matched' hostList={matched} allowClick={true} displayInterested={true} />
                <MatchTable tableName='Declined' hostList={rejected} allowClick={true} displayInterested={true} />
                <MatchTable tableName='Unmatched' hostList={unmatched} allowClick={true} displayInterested={false} />

            </Grid>
        </React.Fragment>
    );
};