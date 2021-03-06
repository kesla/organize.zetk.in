import * as types from '../actions';


export default function user(state = null, action) {
    switch (action.type) {
        case types.GET_USER_INFO + '_FULFILLED':
            return Object.assign({}, state, {
                user: action.payload.data.data,
            });

        case types.GET_USER_MEMBERSHIPS + '_FULFILLED':
            // Add only active memberships
            let officialMemberships = action.payload.data.data.filter(m => 
                (m.role != null));

            return Object.assign({}, state, {
                memberships: officialMemberships,
                activeMembership: (officialMemberships.length > 0)?
                    officialMemberships[0] : null,
            });

        case types.SET_ACTIVE_MEMBERSHIP:
            return Object.assign({}, state, {
                activeMembership: action.payload.membership
            });

        default:
            return state || {
                user: null,
                memberships: null,
                activeMembership: null,
            };
    }
}
