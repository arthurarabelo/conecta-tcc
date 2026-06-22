<?php

namespace Tests\Feature\KnowledgeArea;

use App\Models\KnowledgeArea;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class IndexKnowledgeAreaTest extends TestCase
{
    use RefreshDatabase;

    public function test_returns_all_knowledge_areas(): void
    {
        KnowledgeArea::create(['name' => 'Inteligência Artificial']);
        KnowledgeArea::create(['name' => 'Banco de Dados']);
        KnowledgeArea::create(['name' => 'Redes de Computadores']);

        $response = $this->getJson('/api/knowledge-areas');

        $response->assertStatus(200)
            ->assertJsonCount(3);
    }

    public function test_sorts_by_name_by_default(): void
    {
        KnowledgeArea::create(['name' => 'Zootecnia Computacional']);
        KnowledgeArea::create(['name' => 'Arquitetura de Software']);
        KnowledgeArea::create(['name' => 'Matemática Aplicada']);

        $response = $this->getJson('/api/knowledge-areas');

        $response->assertStatus(200);
        $data = $response->json();
        $names = array_column($data, 'name');
        $this->assertEquals(
            ['Arquitetura de Software', 'Matemática Aplicada', 'Zootecnia Computacional'],
            $names,
        );
    }

    public function test_sorts_by_id(): void
    {
        $a = KnowledgeArea::create(['name' => 'C']);
        $b = KnowledgeArea::create(['name' => 'A']);
        $c = KnowledgeArea::create(['name' => 'B']);

        $response = $this->getJson('/api/knowledge-areas?sort_by=id');

        $response->assertStatus(200);
        $ids = array_column($response->json(), 'id');
        $this->assertEquals([$a->id, $b->id, $c->id], $ids);
    }

    public function test_invalid_sort_by_falls_back_to_name(): void
    {
        KnowledgeArea::create(['name' => 'B']);
        KnowledgeArea::create(['name' => 'A']);

        $response = $this->getJson('/api/knowledge-areas?sort_by=nonexistent');

        $response->assertStatus(200);
        $names = array_column($response->json(), 'name');
        $this->assertEquals(['A', 'B'], $names);
    }

    public function test_sorts_in_descending_order(): void
    {
        KnowledgeArea::create(['name' => 'A']);
        KnowledgeArea::create(['name' => 'B']);
        KnowledgeArea::create(['name' => 'C']);

        $response = $this->getJson('/api/knowledge-areas?order=desc');

        $response->assertStatus(200);
        $names = array_column($response->json(), 'name');
        $this->assertEquals(['C', 'B', 'A'], $names);
    }
}
