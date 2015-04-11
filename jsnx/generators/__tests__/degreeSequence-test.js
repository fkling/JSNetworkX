/*global assert*/
'use strict';

import {DiGraph} from '../../classes';
import JSNetworkXError from '../../exceptions/JSNetworkXError';

import {havelHakimiGraph} from '../degreeSequence';

export var degreeSequence = {

  // TODO: test_configuration_model_empty
  // TODO: test_configuration_model
  // TODO: test_configuration_raise
  // TODO: test_configuration_raise_odd
  // TODO: test_directed_configuration_raise_unequal
  // TODO: test_directed_configuration_mode
  // TODO: test_expected_degree_graph_empty
  // TODO: test_expected_degree_graph
  // TODO: test_expected_degree_graph_selfloops
  // TODO: test_expected_degree_graph_skew

  testHavelHakimiConstruction: function() {
    var G = havelHakimiGraph([]);
    assert.equal(G.numberOfNodes(), 0);

    var z = [1000, 3, 3, 3, 3, 2, 2, 2, 1, 1, 1];
    assert.throws(() => havelHakimiGraph(z), JSNetworkXError);

    z = ['A', 3, 3, 3, 3, 2, 2, 2, 1, 1, 1];
    assert.throws(() => havelHakimiGraph(z), JSNetworkXError);

    z = [5, 4, 3, 3, 3, 2, 2, 2];
    assert.doesNotThrow(() => havelHakimiGraph(z));
    //TODO: G = jsnx.configuration_model(z);

    z = [6, 5, 4, 4, 2, 1, 1, 1];
    assert.throws(() => havelHakimiGraph(z), JSNetworkXError);

    z = [10, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2];
    assert.doesNotThrow(() => havelHakimiGraph(z));

    assert.throws(() => havelHakimiGraph(z, new DiGraph()), JSNetworkXError);
  }

  // TODO: test_directed_havel_hakimi
  // TODO: test_degree_sequence_tree
  // TODO: test_random_degree_sequence_graph
  // TODO: test_random_degree_sequence_graph_raise
  // TODO: test_random_degree_sequence_large
};
