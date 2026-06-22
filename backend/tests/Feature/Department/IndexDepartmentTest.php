<?php

namespace Tests\Feature\Department;

use App\Models\Department;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class IndexDepartmentTest extends TestCase
{
    use RefreshDatabase;

    public function test_returns_all_departments(): void
    {
        Department::create(['name' => 'Ciência da Computação', 'code' => 'CC']);
        Department::create(['name' => 'Sistemas de Informação', 'code' => 'SI']);
        Department::create(['name' => 'Engenharia de Software', 'code' => 'ES']);

        $response = $this->getJson('/api/departments');

        $response->assertStatus(200)
            ->assertJsonCount(3);
    }

    public function test_sorts_by_name_by_default(): void
    {
        Department::create(['name' => 'Zootecnia', 'code' => 'ZOO']);
        Department::create(['name' => 'Arquitetura', 'code' => 'ARQ']);
        Department::create(['name' => 'Matemática', 'code' => 'MAT']);

        $response = $this->getJson('/api/departments');

        $response->assertStatus(200);
        $data = $response->json();
        $names = array_column($data, 'name');
        $this->assertEquals(['Arquitetura', 'Matemática', 'Zootecnia'], $names);
    }

    public function test_sorts_by_id(): void
    {
        $a = Department::create(['name' => 'C', 'code' => 'CC']);
        $b = Department::create(['name' => 'A', 'code' => 'AA']);
        $c = Department::create(['name' => 'B', 'code' => 'BB']);

        $response = $this->getJson('/api/departments?sort_by=id');

        $response->assertStatus(200);
        $ids = array_column($response->json(), 'id');
        $this->assertEquals([$a->id, $b->id, $c->id], $ids);
    }

    public function test_sorts_by_code(): void
    {
        Department::create(['name' => 'A', 'code' => 'ZZ']);
        Department::create(['name' => 'B', 'code' => 'AA']);
        Department::create(['name' => 'C', 'code' => 'MM']);

        $response = $this->getJson('/api/departments?sort_by=code');

        $response->assertStatus(200);
        $codes = array_column($response->json(), 'code');
        $this->assertEquals(['AA', 'MM', 'ZZ'], $codes);
    }

    public function test_invalid_sort_by_falls_back_to_name(): void
    {
        Department::create(['name' => 'B', 'code' => 'BB']);
        Department::create(['name' => 'A', 'code' => 'AA']);

        $response = $this->getJson('/api/departments?sort_by=invalid_column');

        $response->assertStatus(200);
        $names = array_column($response->json(), 'name');
        $this->assertEquals(['A', 'B'], $names);
    }

    public function test_sorts_in_descending_order(): void
    {
        Department::create(['name' => 'A', 'code' => 'AA']);
        Department::create(['name' => 'B', 'code' => 'BB']);
        Department::create(['name' => 'C', 'code' => 'CC']);

        $response = $this->getJson('/api/departments?order=desc');

        $response->assertStatus(200);
        $names = array_column($response->json(), 'name');
        $this->assertEquals(['C', 'B', 'A'], $names);
    }

    public function test_invalid_order_falls_back_to_asc(): void
    {
        Department::create(['name' => 'B', 'code' => 'BB']);
        Department::create(['name' => 'A', 'code' => 'AA']);

        $response = $this->getJson('/api/departments?order=invalid');

        $response->assertStatus(200);
        $names = array_column($response->json(), 'name');
        $this->assertEquals(['A', 'B'], $names);
    }
}
